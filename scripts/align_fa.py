"""Khớp TỪNG CHỮ chính xác cho bài hát riêng: tách giọng ca sĩ (Demucs) rồi dóng cưỡng bức lời đã biết
vào giọng hát (torchaudio MMS forced alignment). Không in lời hay link nhạc ra log."""
import os, sys, json, re, urllib.request, tempfile, subprocess, glob
REF=os.environ['PROJECT_REF']; TOK=os.environ['SUPABASE_ACCESS_TOKEN']; SID=sys.argv[1]
if not re.fullmatch(r'[0-9a-f-]{36}',SID): sys.exit('bad id')
def api(path, body=None):
    req=urllib.request.Request('https://api.supabase.com/v1/projects/'+REF+path, data=json.dumps(body).encode() if body is not None else None,
        method='POST' if body is not None else 'GET', headers={'Authorization':'Bearer '+TOK,'Content-Type':'application/json','User-Agent':'align'})
    return json.load(urllib.request.urlopen(req))
sql=lambda q: api('/database/query',{'query':q})
row=sql(f"select audio_path, lines from public.private_songs where id='{SID}'")[0]
lines=row['lines'] if isinstance(row['lines'],list) else json.loads(row['lines'])
key=[k['api_key'] for k in api('/api-keys?reveal=true') if k.get('name')=='service_role'][0]
d=tempfile.mkdtemp(); src=os.path.join(d,'song.'+row['audio_path'].split('.')[-1])
req=urllib.request.Request(f"https://{REF}.supabase.co/storage/v1/object/psong/{row['audio_path']}",headers={'Authorization':'Bearer '+key,'apikey':key})
open(src,'wb').write(urllib.request.urlopen(req).read())
# 1) tách giọng hát
subprocess.run([sys.executable,'-m','demucs','--two-stems=vocals','-n','htdemucs','-o',d,src],check=True,stdout=subprocess.DEVNULL)
voc=glob.glob(os.path.join(d,'htdemucs','*','vocals.wav'))[0]
# 2) dóng cưỡng bức
import torch, torchaudio
bundle=torchaudio.pipelines.MMS_FA; model=bundle.get_model(); tok=bundle.get_tokenizer(); aligner=bundle.get_aligner()
wav,sr=torchaudio.load(voc); wav=wav.mean(0,keepdim=True); wav=torchaudio.functional.resample(wav,sr,bundle.sample_rate)
with torch.inference_mode(): em,_=model(wav)
ratio=wav.shape[1]/em.shape[1]/bundle.sample_rate
sung=lambda en: re.sub(r'\([^)]*\)[.…\s]*','',en).split()
clean=lambda w: re.sub(r"[^a-z']",'',w.lower().replace('’',"'")).strip("'")
words=[];owner=[]
for li,l in enumerate(lines):
    for wi,w in enumerate(sung(l['en'])):
        c=clean(w)
        if c: words.append(c); owner.append((li,wi))
# 3) mốc từng câu: Whisper nghe trên giọng đã tách (ít nhiễu) → mỗi câu chỉ dóng trong cửa sổ quanh mốc của nó
from faster_whisper import WhisperModel
import difflib
wm=WhisperModel('small.en',device='cpu',compute_type='int8')
segs,_=wm.transcribe(voc,language='en',word_timestamps=True,vad_filter=False,condition_on_previous_text=False,initial_prompt=' '.join(' '.join(sung(l['en'])) for l in lines)[:800])
H=[(clean(w.word),w.start,w.end) for sg in segs for w in (sg.words or []) if clean(w.word)]
sm=difflib.SequenceMatcher(None,words,[h[0] for h in H],autojunk=False)
hm={}
for a0,b0,n in sm.get_matching_blocks():
    for k in range(n): hm[a0+k]=b0+k
LS=[None]*len(lines); LE=[None]*len(lines)
for k,(li,wi) in enumerate(owner):
    if k in hm:
        h=H[hm[k]]; LS[li]=h[1] if LS[li] is None else min(LS[li],h[1]); LE[li]=h[2] if LE[li] is None else max(LE[li],h[2])
def nb(arr,i,step):
    j=i+step
    while 0<=j<len(arr) and arr[j] is None: j+=step
    return arr[j] if 0<=j<len(arr) else None
times={}; fr=lambda t:max(0,min(em.shape[1],int(t/ratio)))
for li,l in enumerate(lines):
    idx=[k for k,(x,_) in enumerate(owner) if x==li]
    if not idx: continue
    s0=LS[li] if LS[li] is not None else (nb(LE,li,-1) or 0); e0=LE[li] if LE[li] is not None else (nb(LS,li,1) or s0+6)
    lo=max(s0-1.2, (nb(LE,li,-1) or 0)-0.3); hi=e0+1.2
    nx=nb(LS,li,1)
    if nx is not None: hi=min(hi,nx+0.6)
    a1,b1=fr(lo),fr(max(hi,lo+0.5*len(idx)+0.5))
    try:
        sp=aligner(em[0,a1:b1],tok([words[k] for k in idx]))
        ws=[[round((a1+x[0].start)*ratio,2),round((a1+x[-1].end)*ratio,2)] for x in sp]
        if ws[0][1]-ws[0][0]>3 and LS[li] is not None: raise ValueError('lệch')
    except Exception:
        ws=[[H[hm[k]][1],H[hm[k]][2]] if k in hm else None for k in idx]
    for (li2,wi),w in zip([owner[k] for k in idx],ws):
        if w: times[(li2,wi)]=w
hit=0
for li,l in enumerate(lines):
    n=len(sung(l['en']))
    if not n: l.pop('w',None); continue
    ws=[times.get((li,wi)) for wi in range(n)]
    if not any(ws): continue
    for a in range(n):  # chữ không dóng được (số, ký hiệu) → chen giữa 2 chữ bên cạnh
        if ws[a] is None:
            p=next((j for j in range(a-1,-1,-1) if ws[j]),None); q=next((j for j in range(a+1,n) if ws[j]),None)
            s0=ws[p][1] if p is not None else ws[q][0]-0.3; s1=ws[q][0] if q is not None else s0+0.3; ws[a]=[round(s0,2),round(max(s0+0.08,s1),2)]
    l['w']=ws; l['t']=ws[0][0]; hit+=1
# câu không có chữ hát (huýt sáo...) → đặt sau câu trước
for i,l in enumerate(lines):
    if not l.get('w'):
        prev=next((lines[j]['w'][-1][1] for j in range(i-1,-1,-1) if lines[j].get('w')),0); l['t']=round(prev+0.3,2)
js=json.dumps(lines,ensure_ascii=False)
sql(f"update public.private_songs set lines=$J${js}$J$::jsonb, updated_at=now() where id='{SID}'")
print(f"OK (tách giọng + dóng cưỡng bức): {hit}/{len(lines)} câu có thời gian từng chữ; {len(words)} chữ.")
