import zipfile,os,json
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
z=zipfile.ZipFile(os.path.join(root,'blender/quaternius-universal-base-characters-standard.zip'))
for n in z.namelist():
 if n.endswith('License_Standard.txt'):print(z.read(n).decode())
 if n.endswith('Superhero_Male_FullBody.gltf'):
  j=json.loads(z.read(n));print('MATERIALS',[(m.get('name'),m.get('pbrMetallicRoughness')) for m in j.get('materials',[])]);print('NODES',[(o.get('name'),o.get('translation'),o.get('mesh')) for o in j.get('nodes',[])]);print('IMAGES',j.get('images'));print('ANIMATIONS',[a.get('name') for a in j.get('animations',[])])
print('HAIR',[n for n in z.namelist() if n.endswith('.gltf') and ('SimpleParted' in n or 'Eyebrows_Regular' in n)])
dest=os.path.abspath(os.path.join(root,'external/quaternius-base'))
for n in z.namelist():
 target=os.path.abspath(os.path.join(dest,n))
 if os.path.commonpath([dest,target])!=dest:raise ValueError('Unsafe archive path')
z.extractall(dest)
