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
spans=aligner(em[0],tok(words))
times={}
for (li,wi),sp in zip(owner,spans): times[(li,wi)]=[round(sp[0].start*ratio,2),round(sp[-1].end*ratio,2)]
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
