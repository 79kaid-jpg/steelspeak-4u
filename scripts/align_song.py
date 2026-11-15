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
H=[(norm(w.word),w.start) for s in segs for w in (s.words or []) if norm(w.word)]
L=[];[L.extend((norm(w),i) for w in re.sub(r'\([^)]*\)[.…\s]*','',l['en']).split() if norm(w)) for i,l in enumerate(lines)]
sm=difflib.SequenceMatcher(None,[w for w,_ in L],[w for w,_ in H],autojunk=False)
first={}  # câu -> (vị trí từ trong câu, thời gian)
pos={}
for i,(w,li) in enumerate(L): pos.setdefault(li,i)
for a,b,n in sm.get_matching_blocks():
    for k in range(n):
        li=L[a+k][1]; off=(a+k)-pos[li]; t=H[b+k][1]
        if li not in first or off<first[li][0]: first[li]=(off,t)
T=[None]*len(lines)
for li,(off,t) in first.items(): T[li]=max(0,t-off*0.35-0.1)  # lùi lại nếu khớp từ giữa câu
# câu không khớp (huýt sáo...) → nội suy giữa 2 câu lân cận
for i in range(len(T)):
    if T[i] is None:
        p=next((j for j in range(i-1,-1,-1) if T[j] is not None),None); q=next((j for j in range(i+1,len(T)) if T[j] is not None),None)
        if p is not None and q is not None: T[i]=T[p]+(T[q]-T[p])*(i-p)/(q-p)
        elif p is not None: T[i]=T[p]+4
        elif q is not None: T[i]=max(0,T[q]-4)
        else: T[i]=i*4.0
for i in range(1,len(T)):  # luôn tăng dần
    if T[i]<=T[i-1]: T[i]=T[i-1]+0.3
for l,t in zip(lines,T): l['t']=round(t,2)
js=json.dumps(lines,ensure_ascii=False).replace('$$$','')
sql(f"update public.private_songs set lines=$J${js}$J$::jsonb, updated_at=now() where id='{SID}'")
print(f"OK: {len(first)}/{len(lines)} câu khớp trực tiếp từ giọng hát, {len(lines)-len(first)} câu nội suy; {len(H)} từ nhận dạng.")
