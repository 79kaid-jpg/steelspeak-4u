"""Tự khớp thời gian từng câu cho bài hát riêng (private_songs) bằng nhận dạng giọng hát (faster-whisper).
Chạy trong GitHub Action align-song.yml. Không in lời bài hát hay link nhạc ra log."""
import os, sys, json, re, difflib, urllib.request, tempfile
REF=os.environ['PROJECT_REF']; TOK=os.environ['SUPABASE_ACCESS_TOKEN']; SID=sys.argv[1]
def api(path, body=None, method=None):
    req=urllib.request.Request('https://api.supabase.com/v1/projects/'+REF+path, data=json.dumps(body).encode() if body is not None else None,
        method=method or ('POST' if body is not None else 'GET'), headers={'Authorization':'Bearer '+TOK,'Content-Type':'application/json','User-Agent':'align'})
    return json.load(urllib.request.urlopen(req))
def sql(q): return api('/database/query',{'query':q})
if not re.fullmatch(r'[0-9a-f-]{36}',SID): sys.exit('bad id')
row=sql(f"select audio_path, lines from public.private_songs where id='{SID}'")[0]
lines=row['lines'] if isinstance(row['lines'],list) else json.loads(row['lines'])
key=[k['api_key'] for k in api('/api-keys?reveal=true') if k.get('name')=='service_role'][0]
req=urllib.request.Request(f"https://{REF}.supabase.co/storage/v1/object/psong/{row['audio_path']}",headers={'Authorization':'Bearer '+key,'apikey':key})
f=tempfile.NamedTemporaryFile(suffix='.'+row['audio_path'].split('.')[-1],delete=False); f.write(urllib.request.urlopen(req).read()); f.close()
from faster_whisper import WhisperModel
m=WhisperModel(os.environ.get('WHISPER_MODEL','small.en'),device='cpu',compute_type='int8')
prompt=' '.join(re.sub(r'\([^)]*\)','',l['en']) for l in lines)[:800]
segs,_=m.transcribe(f.name,language='en',word_timestamps=True,vad_filter=False,initial_prompt=prompt,condition_on_previous_text=False)
norm=lambda w:re.sub(r"[^a-z0-9']",'',w.lower().replace('’',"'"))
H=[(norm(w.word),w.start,w.end) for s in segs for w in (s.words or []) if norm(w.word)]
L=[]
for i,l in enumerate(lines):
    for w in re.sub(r'\([^)]*\)[.…\s]*','',l['en']).split(): L.append((norm(w),i))
sm=difflib.SequenceMatcher(None,[w for w,_ in L],[x[0] for x in H],autojunk=False)
match=[None]*len(L)
for a0,b0,n in sm.get_matching_blocks():
    for k in range(n): match[a0+k]=b0+k
T=[None]*len(lines); hit=0
for li in range(len(lines)):
    idx=[k for k,(w,x) in enumerate(L) if x==li]
    if not idx or all(match[k] is None for k in idx): continue
    hit+=1; ws=[[H[match[k]][1],H[match[k]][2]] if match[k] is not None else None for k in idx]
    for a1 in range(len(ws)):
        if ws[a1] is None:
            p=next((j for j in range(a1-1,-1,-1) if ws[j]),None); q=next((j for j in range(a1+1,len(ws)) if ws[j]),None)
            s0=ws[p][1] if p is not None else ws[q][0]-0.4*(q-a1); s1=ws[q][0] if q is not None else s0+0.4*(a1-p)
            pp=-1 if p is None else p; qq=len(ws) if q is None else q; st=(s1-s0)/max(1,qq-pp-1); pos=a1-pp-1
            ws[a1]=[s0+st*pos,s0+st*(pos+1)]
    lines[li]['w']=[[round(max(0,x),2),round(max(x+0.08,y),2)] for x,y in ws]; T[li]=lines[li]['w'][0][0]
for i in range(len(T)):
    if T[i] is None:
        p=next((j for j in range(i-1,-1,-1) if T[j] is not None),None); q=next((j for j in range(i+1,len(T)) if T[j] is not None),None)
        T[i]=T[p]+(T[q]-T[p])*(i-p)/(q-p) if p is not None and q is not None else (T[p]+4 if p is not None else (max(0,T[q]-4) if q is not None else i*4.0))
for i in range(1,len(T)):
    if T[i]<=T[i-1]: T[i]=T[i-1]+0.3
for l,t in zip(lines,T): l['t']=round(t,2)
js=json.dumps(lines,ensure_ascii=False).replace('$$$','')
sql(f"update public.private_songs set lines=$J${js}$J$::jsonb, updated_at=now() where id='{SID}'")
print(f"OK: {hit}/{len(lines)} câu khớp từ giọng hát (có thời gian từng chữ); {len(H)} từ nhận dạng.")
