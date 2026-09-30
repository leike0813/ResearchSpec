# Scientific Agent Skills Extension Anchor Review — v2.70.0

## Registry And Domain Review

- capability entries: 56
- profile entries: 56
- Scientific Agent Skills 领域分配由 `src/plugins/domain-catalog.json` 自动镜像
- 每个领域只包含其 reviewed raw Skills 对应 extension
- extension capability IDs 与 raw Skill IDs 不冲突；与 bundled capabilities 不冲突。

## Package Review

| capability_id | package tree SHA-256 | profile SHA-256 | tool files | tools byte-identical | required fields bound |
|---|---|---|---|---|---|
| `plugin-scientific-agent-skills-aeon` | `eac52367e748d98621ab5febb7bd3dcd52975c8b157072391e8a82ff932b18cb` | `ad7fc7838bbad822dfa343750222de1efd06920ace7d296f298aa1e56cd552e4` | 11 | yes | yes |
| `plugin-scientific-agent-skills-analytical-method-validation` | `a94a3afa8931a87426ac78e83bd7da9881e453510a7ec78436a70b3628a2f22b` | `75823d3c7ebae81eb094b05f3312d38a6c8ce1e51e8a723d1e79a04d23ff7df6` | 16 | yes | yes |
| `plugin-scientific-agent-skills-astropy` | `17309ce94ba709af69b28c09f960efc33201a68a6956b8fb69a63a54f2be2fd7` | `de8cdadeda6f83558e71ed75352921c8b34d62f481ec4550589385b2782dc66e` | 7 | yes | yes |
| `plugin-scientific-agent-skills-benchling-integration` | `173ebd34e0352eea0fe8607c6e5b1c0724af59e6ea95ce760deda0d0c6be8082` | `f6fca0c475542e946d654e56f3b49f18f81eab57a4fd747d04f36d1ebf4c3724` | 5 | yes | yes |
| `plugin-scientific-agent-skills-cirq` | `4d78f2884fdbf2536a5e910fba82ffc3db357280869ea93952e18f3d15875d50` | `75619696bec6a10fc806d78f5c602bfec3b27541b06ef58a49b67439adee7ac6` | 6 | yes | yes |
| `plugin-scientific-agent-skills-datalad` | `02a93b502a118e89c29b6f4e48b13b8f4ed16a87119b61fa6473d8e4bc026555` | `db01add65406090cfe83d57561e5c388bda3f8f04a5d6307f384c9a89f32dd44` | 3 | yes | yes |
| `plugin-scientific-agent-skills-fluidsim` | `1587d6d50f598bd6662b336c34f2a1d63e9934e6395e3f76c8b55dd7c7f012fa` | `17c28bbf59f832e09d781da0a327176499cd93afb9cad4cb71c1cd3ec81a08f8` | 15 | yes | yes |
| `plugin-scientific-agent-skills-generate-image` | `32bcb54b90dabc4f024901c7c508273c0f19983b31fc2efc1bc05d826958fdf9` | `34818885084cfb22cc86319bdbb07454ad7eee78ac0320a1f4fecef1bc912c60` | 2 | yes | yes |
| `plugin-scientific-agent-skills-genomic-coordinates` | `dc4f253dc678a3be73629d29f99fa47710e61470fd1c682f4b8708b449cfa2d2` | `0ca55c88fa7bcd6f50efd09788b0239a39e0fdfcbc700a6c0a8427a6341d77f2` | 9 | yes | yes |
| `plugin-scientific-agent-skills-geomaster` | `b5f01fbe7acb7a470cc2463e3e8ba916a611cf3d2f2a59db0989d5653a038cf8` | `dfaf987eafd72137c28c62fefca7f365b1be73a3181dec427de384b8c8f769a7` | 15 | yes | yes |
| `plugin-scientific-agent-skills-geopandas` | `f3dbbcf64f60bfbb29c4f1a99d07f4fe98d762b488b1cf4a1077253266293c36` | `1582a7f68d0239f480858fe1289f111d83fa97804bf6474973a6dc294d2af2a4` | 13 | yes | yes |
| `plugin-scientific-agent-skills-ginkgo-cloud-lab` | `7722bf9f4fa48df3ae7b44acbe90bcfeed3c7d23944f089a00def0e1e207cf77` | `c998e9e781860d915bc3e0a052e67bd396549855366eafac6d5dfcf019331c90` | 17 | yes | yes |
| `plugin-scientific-agent-skills-infographics` | `d4cab75fb6a5955307810ec2a00631aab0ed5bca29bb93af96ba703fb4533797` | `bc9f0ddfe578cc8497b5158901165cb722ae534a8a3d4c3bb692989aa930d33b` | 5 | yes | yes |
| `plugin-scientific-agent-skills-lab-hardware-cad` | `4cf8e67461a28d724b060d2887dc294920b93de71d147dcd79b54deab74b6281` | `ba24aefbd1829bde1c09cddf701a3b6b8456d7d0842b8134b4b0a80ef7e30e24` | 12 | yes | yes |
| `plugin-scientific-agent-skills-labarchive-integration` | `c79a5da0a544d570f61e7322d159b0399e5ab44c43b76bf47d1ec27978ff0b35` | `7eb0da74b562733967766c3e9f5143248559899d8782ab398167a150a43ee8c5` | 7 | yes | yes |
| `plugin-scientific-agent-skills-latex-posters` | `e29f82f7c5ff62ec0e1b33eabac9da7f266451f7afbd0423dc37ca37b3379424` | `304dd3704ac953337d5ce1a20acc86beb79a6ac1b0b6900aacfe8fa04e8fdc8b` | 14 | yes | yes |
| `plugin-scientific-agent-skills-liteparse` | `75bff45c7ce15449bbf525f8f903f0a5d362495a35a6baa60223d203989b7cdb` | `2239de72c8cad062be4703d09d6f9ef0c1af3790ced53fcc0c9ebca125af9f32` | 6 | yes | yes |
| `plugin-scientific-agent-skills-markdown-mermaid-writing` | `237ad23d99fa574270a3aaff7c5e6241d562ac8715d76b11fe048073e9ac50ae` | `5572012b92e45d994596c779312299ef2945f4d455acd96c48556a07839d963b` | 36 | yes | yes |
| `plugin-scientific-agent-skills-markitdown` | `e3e4ec1c972cf937c7742884607fd033412e34c73c706b356e83e68b84351555` | `a22414be86a094d0865e586bb227e2944e26168c99bdaaf8d1e876cd6834913a` | 10 | yes | yes |
| `plugin-scientific-agent-skills-matlab` | `b680b9d3014e60fe874621585eb9dc8ab7d575d428af077402e961b67392338e` | `6a04bc6aae10be04145feb58a7a1fd4c384bd38afc367f4cca5fefc8fa9f6e1d` | 19 | yes | yes |
| `plugin-scientific-agent-skills-matplotlib` | `4c9bb4592ba15e7a440f34b27fb6ccd52821ba1dcea2724affd157bf3e41d292` | `1c69886f19bbfae50119612abf6e9b1cebaca32be0879420b5d6e502f142b1b9` | 6 | yes | yes |
| `plugin-scientific-agent-skills-modal` | `a354ecc962418c3289af403416ab22b16c934c6a4fba21629de0eebaba1c9a96` | `ea54f92df7ce3c3f9ab281a7dcb258443e7b835fed03b33aa7580e23ce57999a` | 11 | yes | yes |
| `plugin-scientific-agent-skills-networkx` | `2629847b0bcdc6c280946be232db80d2cf2280c8e12f1b02e77706ff354eef61` | `7683f47da83ebc03915b70979176d9f1cf12a14dae44067e08b66128528dabca` | 5 | yes | yes |
| `plugin-scientific-agent-skills-ontology-term-resolution` | `f3b68cbf4bbe802f1a682b5eb46bd5e7758ab3f7289bdd55ce0dfba4062a2e2a` | `7dd2fbaafd7f7a719d37d0decf707507634806165149ca8df0fde7059a3fe0b7` | 11 | yes | yes |
| `plugin-scientific-agent-skills-open-notebook` | `da9c08f097ff495d86b56e9ee4be570adc378ddb4633c6277a60582ee7eef154` | `3867eb720a6f8ea480a339fa201ca8fafd63bfe62bb418714673d4f151015ca8` | 7 | yes | yes |
| `plugin-scientific-agent-skills-opentrons-integration` | `cfa71222bb7a7e3fb7192ccc15ca0b1a11c12203b038ee8189a95bcd202790fc` | `ddcbb4f2ba652b7b38d7520122864082b98de52e37c1092c239fb8b2e3bc9761` | 15 | yes | yes |
| `plugin-scientific-agent-skills-optimize-for-gpu` | `919a97a361db113f3b4c1b8e1f857ff8758a1a3f280647ecb714b6d112f77c39` | `59c423123b60b0742986e8f3e70aea876c2598c660864367e9e074828ad1d40d` | 15 | yes | yes |
| `plugin-scientific-agent-skills-pacsomatic` | `38ee67d0fd8ce33e4fb876173c2582ac09188a4504c46b5888bacc73d80f5476` | `9b0652244a02885ddc1b1e13a18527502db8699ab7985a845a99bcf49aa93494` | 4 | yes | yes |
| `plugin-scientific-agent-skills-parallel-web` | `e713882528326331384c885897fa9bf17c0fa0d83cd37eea0bf2c373fc2db3ef` | `588cf7d466fbddcaa869951ab39bddd1872661e591ff629a86cfc95e0b63785e` | 0 | yes | yes |
| `plugin-scientific-agent-skills-pennylane` | `b63250549cd367813c44e6e87417dcb3ded90d4829a54ab6f98780243feddbb6` | `a2386da94735ba7a2627e2ad7bcd69ff580d81fadaa9cc4507d37d7fd3a0c643` | 7 | yes | yes |
| `plugin-scientific-agent-skills-pptx-posters` | `1945b526c3ee8ed80d7401368f4fd90ea303553431e68b73bc403c567614a43d` | `c3e311f6421817fb4ff8672b9b376c0b0eea6b8c30ed0cc21f8d80a1be66a3f7` | 20 | yes | yes |
| `plugin-scientific-agent-skills-protocolsio-integration` | `6b19a93160eb296ca482f4a89edc4a7779cf228e5dec4a75f24350142893369c` | `6562b92e58a617e6b4301d07f1e41fd7cd6d19fbf078880122393bb3dd61ceb5` | 14 | yes | yes |
| `plugin-scientific-agent-skills-pufferlib` | `009cd0df8670f42ba6b252e3cd36bc773286e43154919171cf0d4baa4f035e1f` | `c8c98524eb94b34d1e21b068a188e372efb4afc1c766b2f24e77f2b714333f20` | 14 | yes | yes |
| `plugin-scientific-agent-skills-pylabrobot` | `96dadbc70a5286b17225acd69494745a0cfc9d92763e99907781347f96847bc7` | `e0518ed56165f6e2819f7b550b616141efa69ad4d3856bed55c596f4402c6b56` | 14 | yes | yes |
| `plugin-scientific-agent-skills-pymatgen` | `27900faa5bd322697f08a0a80acac12d15619cc2d940c401c0ed4012ce0a2527` | `9f7622e1541ff5828cec6dfbb5596b9eb0665bd24aa1a1d1e699261f53b4e0a4` | 14 | yes | yes |
| `plugin-scientific-agent-skills-pymoo` | `4185cbc920116262570168a4efd1649c5c67034ce0c2f0b101f7938fa6a4a633` | `7afdfecb8797e42853792e2994df6326c6c0bbd0d38dfc1c6005e8468a418dc8` | 12 | yes | yes |
| `plugin-scientific-agent-skills-pytorch-lightning` | `abc386f4d189db3368cf706d5b54d5f1ce51213a04b3d793a01dc5d1d11f8fcc` | `1ecde326a531465da224641af07f437a7cb1e42659cb51d700c0ac31e27c1431` | 10 | yes | yes |
| `plugin-scientific-agent-skills-pyzotero` | `3f46823716efdc8a8b74550d33fa0aa18e758313676b60c294442112388f791f` | `a8a98a066f691a4cb89bd3ca27c7b82e48bf83b32bc9c8f37680a4a5fc2eba89` | 14 | yes | yes |
| `plugin-scientific-agent-skills-qiskit` | `eb895e36ebffa5cac8bfc540d6e5b730e8eec311d693230bbd735a553bc22028` | `2db490a27dea3ba28c27523349315384788e28dd99554e5a158c8a63dc3e25ac` | 14 | yes | yes |
| `plugin-scientific-agent-skills-qutip` | `d21e639d33daa41ffe485c39b06dccd19a1c6239e37a1b7d8691b1fead616b1b` | `624dc5d1d20f2ac8c12a4875184164d5ab1b3ba7249812d32119e5f64233287b` | 12 | yes | yes |
| `plugin-scientific-agent-skills-relsa-severity-assessment` | `4864cf9cd1ff5b21f1e74604c061456ba6c557e4320362d6eb9ce697f68a97d5` | `09423506c6e4152eb3f6e3562e31f5d9f3fec3ae45318aa4768aa235611259f6` | 8 | yes | yes |
| `plugin-scientific-agent-skills-scientific-schematics` | `612e6d524750473dd4a25f3b7c400a77af2c63a2cd962c5515390251747cae38` | `da86d124d6c428cd69b82cae08f6f9d2a8655afa5e87d405a7b72f5ef9c04cb6` | 2 | yes | yes |
| `plugin-scientific-agent-skills-scientific-slides` | `ee0a45f7c6ae2e3a5606bfa2807f78581c4aa97586eaa5daec49938b6bfa8c9a` | `b255cb6e4f4678001e9b73c75e1acb6281fb840e991c7d3ac4ac5b2cfbe811b5` | 19 | yes | yes |
| `plugin-scientific-agent-skills-scientific-visualization` | `31c471a4aae5f0133e44d2b45aca80c02cb42ffae438d0078dae8b332c3112f5` | `8b59a777792a5ff48d2ef1119d18bc7ab3fc484553df0203a98f9ec5f358c7f5` | 17 | yes | yes |
| `plugin-scientific-agent-skills-scikit-learn` | `fb9c12b057fd744870d2ddd5a38646237e8edcd11b4fa0b269b2404d0359157a` | `0ff407485fd2203d9e95089643f6e9a692d363c107007a85648c93b4a52216e5` | 10 | yes | yes |
| `plugin-scientific-agent-skills-seaborn` | `757ace6d71716514186d70db1eccf77c53a33610fd40ad1e6f060f6d407a4c1f` | `7c29b46aa3161607712e7e7129422582288dc2ee41e18b7542e52d056c64cd36` | 7 | yes | yes |
| `plugin-scientific-agent-skills-shap` | `81268983c2586d54bf2c63941ce1193bd8d0a7497256f6dbba18a54f2ba60f07` | `f7bf9cd92797fc89b38a363d6a158e31b13186889c6486dbc17a7fe8527b0f2e` | 9 | yes | yes |
| `plugin-scientific-agent-skills-simpy` | `319e3edd959057f3d9d10c73e3b102f8c1f85e05ff235c9e996fdeaee2ce76ad` | `e9cbe4f2c762897c7cef7cc343429f4fd4d47f2ac23af20698d05becf9b04523` | 15 | yes | yes |
| `plugin-scientific-agent-skills-stable-baselines3` | `b69c3d063a7e8bb2eb01c3873a969d52ad4d5a7261e0e32d5a90ac01ef0eb9c2` | `3b60cb4d5f0a84726a04215faa78a1fb82174c3358757c244450c92c8a602928` | 7 | yes | yes |
| `plugin-scientific-agent-skills-sympy` | `2d75a283c3b7cc1aaab1887a200567c57c77136b8b3caa6efd640ab9dc863bef` | `d2b5683ca7e9ee1249e408c4ccc971b17d6ac6f1cdbf55a9be2dadec774f1df6` | 6 | yes | yes |
| `plugin-scientific-agent-skills-timesfm-forecasting` | `577df1e5c277762cc934bd23480ae588481c261d5f28e4f2394b637b8723f50d` | `1edf09bf1411d55bcc35dee938d93cf14d71079bf9c0630500bb614d083bd99a` | 30 | yes | yes |
| `plugin-scientific-agent-skills-torch-geometric` | `b49f62d6be79e0645a42b3f79b58a4e0f1c6005808c249644f6442345c982317` | `c03a4b5fdba3fc0ba90b067a05f97935d2deb66f33e81854b543257211e93b7e` | 6 | yes | yes |
| `plugin-scientific-agent-skills-transformers` | `e96cd551e7e768f2f2efaadeb3363969d04463591f6489d8dd0694182ea6a641` | `e4536afa73bd2fd3c6a4c51320c01c8a21b0057bf529b496586058ffea815013` | 5 | yes | yes |
| `plugin-scientific-agent-skills-umap-learn` | `562e7d03b2190f04e27cd8bf12f6a27127484d1fabdebdaa0b4b0167dc79e6fb` | `5a25f9a251f9a2e76db1f439033e37c7d0a7bccf0a96d262c430755f2c94e540` | 1 | yes | yes |
| `plugin-scientific-agent-skills-uncertainty-and-units` | `d39506fa2f2308e37037406c0a098f108d497c31d4bb18a0ba3d370107db43ea` | `8a2d27739590da7fdd235da54ee8ef7d6fb61f4f473fe1cb082a3b05382d0338` | 13 | yes | yes |
| `plugin-scientific-agent-skills-venue-templates` | `a85b51cb37036f688c42da8dd5957dcfa5b30fc011991ef66047785a19038c8d` | `afc29cf1af32b733ef9d1c0dcabfa6e07d7fccd19d8679b21803191e14f77039` | 30 | yes | yes |

## Machine Review Artifact

| artifact | path | sha256 |
|---|---|---|
| extension review | `audits/scientific-agent-skills/v2.70.0/artifacts/extension-review.json` | `cc921963d746ee85f8027186e696104dd23bc6e83b14778274df6184e777ec51` |

## Human Confirmation

- [x] 56 个上游语义义务均由 extension SKILL 或 graph profile 承接。
- [x] extension SKILL 不含 next-node / next-phase / agent-team orchestration。
- [x] 命名、registry、审计记录、锚点 manifest 身份一致。
- [x] Agent 语义审阅见 `05-semantic-review.md`。

## Manual Security Decisions

Structured source: `src/vendor-converters/scientific-agent-skills/security-review-decisions.json`.
Current report observations and retained curation targets are reviewed separately from admission.

### fluidsim

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 16/16 files; findings: 0.


- generated-entry-guidance: Identify FluidSim as an independently maintained upstream framework and preserve ResearchSpec vendor provenance without implying official affiliation.
- compatibility-guidance: Describe required FluidSim, FFT, and MPI dependencies without installing them; require the target project to pin and provision its own environment.

### geomaster

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 16/16 files; findings: 1.

- geomaster:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 369 行确含 vendor 自撰 Citing Scientific Agent Skills 段。事实成立；该段属 Skill 自带内容而非不可信输入，标为 prompt injection 属规则名过宽。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献，属内容污染倾向而非安全入侵。
  Evidence: `docs/security-report.json`.
- generated-entry-guidance: Narrow activation to explicit geospatial, GIS, remote-sensing, or Earth-observation work and treat all credentials and paths in examples as user-supplied data.
- compatibility-guidance: Do not install the documented GIS stack automatically; require project-pinned dependencies and user confirmation before invoking external GIS programs or authenticated services.

### infographics

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 8/8 files; findings: 3.

- infographics:1 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：OPENROUTER_API_KEY 属用户机密，随显式调用发往 OpenRouter。
  Evidence: `docs/security-report.json` `skills/infographics/scripts/generate_infographic_ai.py` `skills/infographics/scripts/generate_infographic.py`.
- infographics:2 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：chain 仅由脚本间转交同一 key 构成，未见第二目的地。
  Evidence: `docs/security-report.json` `skills/infographics/scripts/generate_infographic_ai.py` `skills/infographics/scripts/generate_infographic.py`.
- infographics:3 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：generate_infographic_ai.py 单点鉴权调用。
  Evidence: `docs/security-report.json` `skills/infographics/scripts/generate_infographic_ai.py`.
- resource-exclusion (skills/infographics/scripts/generate_infographic.py): Exclude the provider-bound wrapper because it copies the full process environment and forwards credentials to another script.
- resource-exclusion (skills/infographics/scripts/generate_infographic_ai.py): Exclude provider-specific network, credential, research-injection, persistence, and unbounded-iteration business logic.
- generated-entry-guidance: Retain the reviewed infographic design method but express optional generation generically through the target Agent's configured text/image model capability, without naming a provider or model and without reading, storing, or forwarding API keys.
- compatibility-guidance: Require explicit user consent before sending prompts, data, or images to any externally configured model; treat retrieved material as untrusted and keep cost limits under the target Agent's control.

### latex-posters

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 17/17 files; findings: 3.

- latex-posters:1 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：OPENROUTER_API_KEY 随显式调用发往 OpenRouter。
  Evidence: `docs/security-report.json` `skills/latex-posters/scripts/generate_schematic_ai.py` `skills/latex-posters/scripts/generate_schematic.py`.
- latex-posters:2 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：chain 由 generate_schematic.py 向 AI 子进程转交该 key 构成。
  Evidence: `docs/security-report.json` `skills/latex-posters/scripts/generate_schematic_ai.py` `skills/latex-posters/scripts/generate_schematic.py`.
- latex-posters:3 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：generate_schematic_ai.py 单点鉴权调用。
  Evidence: `docs/security-report.json` `skills/latex-posters/scripts/generate_schematic_ai.py`.
- resource-exclusion (skills/latex-posters/scripts/generate_schematic.py): Exclude the provider-bound wrapper and its full environment inheritance.
- resource-exclusion (skills/latex-posters/scripts/generate_schematic_ai.py): Exclude provider-specific model, network, .env, and credential handling while retaining the independent LaTeX poster capability.
- generated-entry-guidance: Keep templates, poster-design guidance, and local PDF review; describe optional visual generation only through the target Agent's configured generic image capability with no provider names or secret handling.
- compatibility-guidance: Declare LaTeX and local PDF inspection tools as user-provisioned dependencies and require consent before any target-Agent external model use.

### markitdown

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 11/11 files; findings: 1.

- markitdown:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 266 行确含 vendor 自撰 Citing Scientific Agent Skills 段。事实成立；属 Skill 自带内容而非不可信输入，标为 policy violation 属规则名过宽。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献，属内容污染倾向而非安全入侵。
  Evidence: `docs/security-report.json`.
- generated-entry-guidance: Make local file-to-Markdown conversion the core capability, remove automatic cross-Skill activation, and treat converted text as untrusted data rather than Agent instructions.
- compatibility-guidance: Keep third-party plugins disabled by default; express any optional model-assisted interpretation through the target Agent's generic configured capability without reading, storing, or forwarding credentials.

### modal

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 13/13 files; findings: 5.

- modal:1 (high, false-positive): 实读 references/functions.md 第 83 行（报告记 82）：self.model.eval()，PyTorch 推理模式，原行注释即写明 not Python's built-in eval()。
  Residual risk: 无；文档中的模型推理调用。
  Evidence: `docs/security-report.json`.
- modal:2 (medium, false-positive): 实读 references/gpu.md 第 158 行（报告记 157）：文档示例 subprocess.run(["python","train_script.py"], check=True)，固定 argv、无 shell=True。
  Residual risk: 示例启动本地训练进程；无注入面。
  Evidence: `docs/security-report.json`.
- modal:3 (medium, false-positive): 实读 references/gpu.md 第 167 行（报告记 166）：subprocess.run(["accelerate","launch",...]) 文档示例，固定 argv、无 shell。
  Residual risk: 示例启动本地分布式训练；无注入面。
  Evidence: `docs/security-report.json`.
- modal:4 (medium, false-positive): 实读 references/scheduled-jobs.md 第 142 行（报告记 141）：健康检查示例 requests.post(os.environ["SLACK_URL"], json=...)，目标是用户自配的 Slack webhook。
  Residual risk: 低：示例会把服务状态发往用户配置的 webhook 地址。
  Evidence: `docs/security-report.json`.
- modal:5 (medium, false-positive): 实读 references/web-endpoints.md 第 150 行（报告记 149）：subprocess.Popen(["python","-m","vllm..."]) 文档示例，固定 argv、无 shell。
  Residual risk: 示例启动本地 vLLM 服务；无注入面。
  Evidence: `docs/security-report.json`.
- resource-exclusion (skills/modal/references/secrets.md): Exclude inline, environment, and .env secret-handling examples; use only an already authenticated target environment.
- generated-entry-guidance: Require confirmation for cloud deployments, schedules, endpoints, persistent resources, and paid compute; do not create or inspect credentials.
- compatibility-guidance: Describe dependencies without installing them; require project-pinned environments and preconfigured Modal authentication.

### pacsomatic

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 7/7 files; findings: 0.


- resource-exclusion (skills/pacsomatic/scripts/run_pacsomatic.py): Exclude host-mutating execution: cloning an arbitrary repository, creating conda/mamba environments, generating executable launch scripts and submitting jobs to schedulers.
- generated-entry-guidance: Retain inputs, configuration, and interpretation guidance; use only a user-provided local pipeline pinned to an immutable revision and show plans for confirmation.
- compatibility-guidance: Do not clone repositories, create environments, submit jobs, or expose raw module-load and extra-argument channels.

### parallel-web

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 7/7 files; findings: 0.


- resource-exclusion (skills/parallel-web/references/web-search.md): Exclude provider-specific CLI, data-transfer, polling, and credential-dependent workflows.
- resource-exclusion (skills/parallel-web/references/web-extract.md): Exclude provider-specific CLI, data-transfer, polling, and credential-dependent workflows.
- resource-exclusion (skills/parallel-web/references/data-enrichment.md): Exclude provider-specific CLI, data-transfer, polling, and credential-dependent workflows.
- resource-exclusion (skills/parallel-web/references/deep-research.md): Exclude provider-specific CLI, data-transfer, polling, and credential-dependent workflows.
- resource-exclusion (skills/parallel-web/references/findall.md): Exclude provider-specific entity-discovery CLI, data-transfer, polling, and credential-dependent workflows.
- resource-exclusion (skills/parallel-web/references/monitor.md): Exclude provider-specific monitoring CLI, persistent external state, webhooks, and credential-dependent workflows.
- generated-entry-guidance: Retain provider-neutral selection for search, URL extraction, repeated enrichment, and deep research through target-Agent capabilities; do not claim all web tasks.
- compatibility-guidance: Do not install a CLI or read, store, or forward API keys; require consent before transmitting queries, URLs, documents, or datasets.

### pptx-posters

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 21/21 files; findings: 0.


- generated-entry-guidance: Retain poster design, templates, and review; optional image generation uses only the target Agent's generic capability without provider names or secret handling.

### qutip

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 13/13 files; findings: 0.


- compatibility-guidance: Describe QuTiP packages as user-provisioned dependencies that ResearchSpec never installs; recommend project-level version locking.
- generated-entry-guidance: Clarify that QFunc.eval performs numerical function evaluation and is not Python's dynamic eval built-in.

### scientific-schematics

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 6/6 files; findings: 5.

- scientific-schematics:1 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：key 随显式调用发往 OpenRouter。
  Evidence: `docs/security-report.json` `skills/scientific-schematics/scripts/generate_schematic_ai.py` `skills/scientific-schematics/scripts/generate_schematic.py`.
- scientific-schematics:2 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：chain 由 generate_schematic.py 向 AI 子进程转交该 key 构成。
  Evidence: `docs/security-report.json` `skills/scientific-schematics/scripts/generate_schematic_ai.py` `skills/scientific-schematics/scripts/generate_schematic.py`.
- scientific-schematics:3 (low, false-positive): 实读 generate_schematic.py 的 resolve_api_key：不存在硬编码密钥，函数仅从 --api-key、环境变量、再到 .env 逐级查找 OPENROUTER_API_KEY。规则名与事实不符。
  Residual risk: 低：函数会向上遍历父目录寻找 .env，可能读到无关 .env 中的同名键；命中项仅该单一键名。
  Evidence: `docs/security-report.json` `skills/scientific-schematics`.
- scientific-schematics:4 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：generate_schematic_ai.py 单点鉴权调用。
  Evidence: `docs/security-report.json` `skills/scientific-schematics/scripts/generate_schematic_ai.py`.
- scientific-schematics:5 (low, partially-confirmed): 实读 SKILL.md 第 372 行：确含 vendor 自撰 Citing Scientific Agent Skills 段。事实成立；属 Skill 自带内容而非不可信输入，标为 policy violation 属规则名过宽。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献，属内容污染倾向而非安全入侵。
  Evidence: `docs/security-report.json`.
- resource-exclusion (skills/scientific-schematics/scripts/example_usage.sh): Exclude provider-, model-, credential-, or executable-specific material from the generic adapted Skill.
- resource-exclusion (skills/scientific-schematics/scripts/generate_schematic.py): Exclude provider-, model-, credential-, or executable-specific material from the generic adapted Skill.
- resource-exclusion (skills/scientific-schematics/scripts/generate_schematic_ai.py): Exclude provider-, model-, credential-, or executable-specific material from the generic adapted Skill.
- generated-entry-guidance: Retain reviewed schematic design practices and express optional generation through the target Agent's generic image capability without provider names, model claims, or secret handling.
- compatibility-guidance: Require consent before externally sending prompts, research content, or reference images; keep iteration and cost controls with the target Agent.

### scientific-slides

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 24/24 files; findings: 5.

- scientific-slides:1 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：四个生成脚本共用同一 key→OpenRouter 通道。
  Evidence: `docs/security-report.json` `skills/scientific-slides/scripts/generate_schematic_ai.py` `skills/scientific-slides/scripts/generate_slide_image_ai.py` `skills/scientific-slides/scripts/generate_schematic.py` `skills/scientific-slides/scripts/generate_slide_image.py`.
- scientific-slides:2 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：chain 由多个 generate_*.py 互转同一 key 构成。
  Evidence: `docs/security-report.json` `skills/scientific-slides/scripts/generate_schematic_ai.py` `skills/scientific-slides/scripts/generate_slide_image_ai.py` `skills/scientific-slides/scripts/generate_schematic.py` `skills/scientific-slides/scripts/generate_slide_image.py`.
- scientific-slides:3 (low, partially-confirmed): 实读 generate_slide_image.py 第 55–80 行的 resolve_key：递归向上查找 .env 中的 OPENROUTER_API_KEY，取值后仅作为声明服务（OpenRouter）的 Bearer 头。
  Residual risk: 低：递归 .env 查找可能命中父目录无关 .env 的同名键，但仅读取该键且发往声明 endpoint。
  Evidence: `docs/security-report.json` `skills/scientific-slides`.
- scientific-slides:4 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：generate_schematic_ai.py 单点鉴权调用。
  Evidence: `docs/security-report.json` `skills/scientific-slides/scripts/generate_schematic_ai.py`.
- scientific-slides:5 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：generate_slide_image_ai.py 单点鉴权调用。
  Evidence: `docs/security-report.json` `skills/scientific-slides/scripts/generate_slide_image_ai.py`.
- resource-exclusion (skills/scientific-slides/scripts/generate_schematic.py): Exclude provider-specific image generation, network, environment, and credential handling.
- resource-exclusion (skills/scientific-slides/scripts/generate_schematic_ai.py): Exclude provider-specific image generation, network, environment, and credential handling.
- resource-exclusion (skills/scientific-slides/scripts/generate_slide_image.py): Exclude provider-specific image generation, network, environment, and credential handling.
- resource-exclusion (skills/scientific-slides/scripts/generate_slide_image_ai.py): Exclude provider-specific image generation, network, environment, and credential handling.
- generated-entry-guidance: Retain slide structure, design, templates, local conversion, and validation; optional visuals use only the target Agent's generic image capability without secret handling.
- compatibility-guidance: Show local input/output paths and obtain confirmation before conversion or pdflatex validation; external image use requires consent.

### seaborn

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 8/8 files; findings: 1.

- seaborn:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 256 行确含 vendor 自撰 Citing Scientific Agent Skills 段，含 arXiv:2609.00065 与网络抓取指示。事实成立；属 Skill 自带内容而非不可信输入。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献；引用的 arXiv 记录需自行核验。
  Evidence: `docs/security-report.json`.
- generated-entry-guidance: Identify the Skill as a ResearchSpec-maintained Seaborn usage guide rather than an official distribution; prefer local datasets and disclose sns.load_dataset network access.
- compatibility-guidance: Do not install dependencies; require a project-pinned Seaborn environment including optional statistical packages when used.

### transformers

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 6/6 files; findings: 1.

- transformers:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 197 行确含 vendor 自撰 Citing Scientific Agent Skills 段。事实成立；属 Skill 自带内容而非不可信输入，标为 policy violation 属规则名过宽。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献，属内容污染倾向而非安全入侵。
  Evidence: `docs/security-report.json`.
- generated-entry-guidance: Default trust_remote_code to false; allow it only for a user-confirmed immutable model revision after reviewing the exact third-party code.
- compatibility-guidance: Use only target-environment authentication; do not read, print, store, or forward HF tokens, and treat downloads, uploads, and remote code as explicit external actions.

### umap-learn

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 2/2 files; findings: 1.

- umap-learn:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 474 行确含 vendor 自撰 Citing Scientific Agent Skills 段，含网络抓取指示。事实成立；属 Skill 自带内容而非不可信输入。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献；引用的 arXiv 记录需自行核验。
  Evidence: `docs/security-report.json`.
- generated-entry-guidance: Limit activation to explicit UMAP-family dimensionality-reduction work and load Parametric UMAP models only from user-confirmed local directories.
- compatibility-guidance: Do not install dependencies; require project-level pins for UMAP and optional clustering or parametric dependencies.

### venue-templates

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 31/31 files; findings: 1.

- venue-templates:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 271 行确含 vendor 自撰 Citing Scientific Agent Skills 段。事实成立；属 Skill 自带内容而非不可信输入，标为 policy violation 属规则名过宽。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献，属内容污染倾向而非安全入侵。
  Evidence: `docs/security-report.json`.
- generated-entry-guidance: Retain venue templates and local query, customization, and validation tools; remove cross-Skill promotion and use only target-Agent generic image capability for optional visuals.
- compatibility-guidance: Show source and output paths, never overwrite by default, and require verification against current official venue requirements.

### bgpt-paper-search

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 1/1 files; findings: 0.


- generated-entry-guidance: Remove BGPT MCP installation, configuration, credential, and provider coupling; retain only provider-neutral query-planning and result-evaluation concepts.
- compatibility-guidance: Do not install or connect an external MCP server and do not read or handle credentials; preserve the independent ToolUniverse overlap blocker.

### bids

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 8/8 files; findings: 0.


- resource-exclusion (skills/bids/scripts/update_schema.py): Exclude arbitrary remote schema fetching and mutation of packaged authoritative references.
- generated-entry-guidance: Use only the audited static BIDS schema and BEP resources distributed with the package; never update package references at user runtime.
- compatibility-guidance: Do not install BIDS tools; require project-pinned dependencies and preserve the independent ToolUniverse overlap blocker.

### cellxgene-census

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 4/4 files; findings: 0.


- generated-entry-guidance: Limit activation to explicit CZ CELLxGENE Census work, prefer a fixed LTS Census version, and confirm that queries contain no private or unpublished data.
- compatibility-guidance: Do not install dependencies; require project-level pins for Census, spatial, and ML packages and preserve the ToolUniverse overlap blocker.

### citation-management

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: arsu-surface-overlap.
- Reviewed inventory: 21/21 files; findings: 6.

- citation-management:1 (critical, partially-confirmed): 当前内容实读：search_pubmed.py 读取 NCBI_API_KEY / NCBI_EMAIL 并请求 eutils.ncbi.nlm.nih.gov；extract_metadata.py 读取 NCBI_API_KEY 并请求 eutils/crossref/arxiv/PMC idconv；search_openalex.py 读取 OPENALEX_EMAIL 请求 api.openalex.org；doi_to_bibtex.py 与 validate_citations.py 无 env 读取。env 与网络同现，但目的地全为声明的公开学术 API，属鉴权传输而非外泄。
  Residual risk: API key/邮箱随显式调用发往声明端点；残余风险为凭据外发与第三方可用性。
  Evidence: `docs/security-report.json` `skills/citation-management/scripts/search_pubmed.py` `skills/citation-management/scripts/extract_metadata.py`.
- citation-management:2 (critical, partially-confirmed): 同上：chain 由五个脚本各自的检索请求聚合，非单点未声明通道。
  Residual risk: 凭据随显式调用发往声明的学术 API。
  Evidence: `docs/security-report.json` `skills/citation-management/scripts/search_pubmed.py` `skills/citation-management/scripts/extract_metadata.py` `skills/citation-management/scripts/search_openalex.py` `skills/citation-management/scripts/validate_citations.py` `skills/citation-management/scripts/doi_to_bibtex.py`.
- citation-management:3 (critical, partially-confirmed): extract_metadata.py 的 NCBI_API_KEY 单点鉴权调用。
  Residual risk: 低：NCBI key 随显式调用发往 NCBI eutils。
  Evidence: `docs/security-report.json` `skills/citation-management/scripts/extract_metadata.py`.
- citation-management:4 (critical, partially-confirmed): search_pubmed.py 的 NCBI_API_KEY / NCBI_EMAIL 单点鉴权调用。
  Residual risk: 低：NCBI key 与邮箱随显式调用发往 NCBI eutils。
  Evidence: `docs/security-report.json` `skills/citation-management/scripts/search_pubmed.py`.
- citation-management:5 (low, partially-confirmed): 实读 SKILL.md 第 331 行：确含 vendor 自撰 Citing Scientific Agent Skills 段。事实成立，属内容污染倾向而非安全入侵。
  Residual risk: 低：会改动用户产出的参考文献。
  Evidence: `docs/security-report.json`.
- citation-management:6 (medium, false-positive): 实读 references/core_workflow.md 第 193 行附近代码块：文档演示的正是安全写法——参数以列表传入 subprocess.run、显式 check=True、注明 no shell=True，且先以正则校验 citation_key。该块是防注入指导，不是注入面。
  Residual risk: 无；文档本身即缓解措施。
  Evidence: `docs/security-report.json`.
- resource-exclusion (skills/citation-management/scripts/doi_to_bibtex.py): Exclude network, proxy, external metadata, provider-specific AI, or credential handling.
- resource-exclusion (skills/citation-management/scripts/extract_metadata.py): Exclude network, proxy, external metadata, provider-specific AI, or credential handling.
- resource-exclusion (skills/citation-management/scripts/search_google_scholar.py): Exclude network, proxy, external metadata, provider-specific AI, or credential handling.
- resource-exclusion (skills/citation-management/scripts/search_pubmed.py): Exclude network, proxy, external metadata, provider-specific AI, or credential handling.
- resource-exclusion (skills/citation-management/scripts/validate_citations.py): Exclude network, proxy, external metadata, provider-specific AI, or credential handling.
- resource-exclusion (skills/citation-management/references/google_scholar_search.md): Exclude provider-, network-, key-, and external-content workflows from the local citation-formatting adaptation.
- resource-exclusion (skills/citation-management/references/pubmed_search.md): Exclude provider-, network-, key-, and external-content workflows from the local citation-formatting adaptation.
- resource-exclusion (skills/citation-management/references/metadata_extraction.md): Exclude provider-, network-, key-, and external-content workflows from the local citation-formatting adaptation.
- resource-exclusion (skills/citation-management/references/citation_validation.md): Exclude provider-, network-, key-, and external-content workflows from the local citation-formatting adaptation.
- generated-entry-guidance: Retain local BibTeX formatting, templates, and checklists only; route literature retrieval and metadata acquisition through the existing ARSU surface or target-Agent capability.
- compatibility-guidance: Treat all external bibliographic metadata as untrusted evidence, handle no API keys, and preserve the independent ARSU overlap blocker.

### clinical-decision-support

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 28/28 files; findings: 1.

- clinical-decision-support:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 240 行确含 vendor 自撰 Citing Scientific Agent Skills 段，指示 Agent 将 arXiv:2609.00065 写入用户交付物、告知用户，并在网络可用时抓取 arXiv 记录。事实成立；该段属 Skill 自带内容而非不可信输入，标为 policy violation 属规则名过宽。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献，属内容污染倾向而非安全入侵；抓取目标是公开 arXiv 记录。
  Evidence: `docs/security-report.json`.
- generated-entry-guidance: Retain local cohort, biomarker, survival, decision-tree, and validation resources; optional visuals may use only target-Agent generic image capability after explicit consent.
- compatibility-guidance: Limit use to research and education, require de-identified inputs and qualified clinical review, and do not present outputs as autonomous diagnosis or treatment decisions.

### clinical-reports

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 36/36 files; findings: 1.

- clinical-reports:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 250 行确含 vendor 自撰 Citing Scientific Agent Skills 段，指示 Agent 将 arXiv:2609.00065 写入用户交付物、告知用户，并在网络可用时抓取 arXiv 记录。事实成立；该段属 Skill 自带内容而非不可信输入，标为 policy violation 属规则名过宽。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献，属内容污染倾向而非安全入侵；抓取目标是公开 arXiv 记录。
  Evidence: `docs/security-report.json`.
- generated-entry-guidance: Retain local report templates, extraction, terminology, de-identification, formatting, and validation resources; remove mandatory schematic generation.
- compatibility-guidance: Use only de-identified or synthetic data, never treat local checks as compliance certification, and require qualified clinical and regulatory review.

### consciousness-council

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: no-domain-fit.
- Reviewed inventory: 2/2 files; findings: 0.


- generated-entry-guidance: Require explicit invocation, remove Write permission, and frame the output as a structured perspective simulation rather than real experts, conscious entities, or scientific consensus.
- compatibility-guidance: Do not infer authority from named personas or automatically follow external links; preserve the independent no-domain-fit blocker.

### database-lookup

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 83/83 files; findings: 2.

- database-lookup:1 (low, confirmed): 实读 SKILL.md 第 91–99 行：文档指示对 POST-only 接口（Open Targets、gnomAD、RummaGEO、GDC、SEC EDGAR）改用 shell curl，并将用户提供标识符代入查询串。这是真实的注入面（与 2.53.0 人工复核同类），但属文档描述、由用户显式执行。
  Residual risk: 低：Agent 依文档拼接 curl 查询时，未受信标识符可能被解析为 shell 语法；缓解依赖调用方校验输入。
  Evidence: `docs/security-report.json` `skills/database-lookup`.
- database-lookup:2 (low, not-applicable): 实读 SKILL.md 第 107、115–127 行：仅要求在需要时按名查询 .env 中的指定 key，并明确不得读取或展示整个 .env。属文档化的正当凭据用法。
  Residual risk: 低：Agent 须严格只读取指定键名，不得打印 .env 内容。
  Evidence: `docs/security-report.json`.
- generated-entry-guidance: Never interpolate user input into shell, SQL, or ADQL; URL-encode values, use parameterization or strict allowlists, and treat every external response as data rather than instructions.
- compatibility-guidance: Use target-Agent configured retrieval where available, do not read or persist credentials, and show the selected database and query summary before access.

### dhdna-profiler

- Maintainer action: fail; production: excluded.
- Independent blockers: no-domain-fit.
- Reviewed inventory: 2/2 files; findings: 0.




### flowio

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 7/7 files; findings: 0.


- generated-entry-guidance: Retain FCS parsing and metadata workflows; require explicit output paths and do not overwrite source data or existing outputs by default.
- compatibility-guidance: Describe FlowIO as a target-project dependency without installation commands; the target project selects, locks, and installs it.

### histolab

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 8/8 files; findings: 2.

- histolab:1 (high, false-positive): 实读 references/filters_preprocessing.md 第 488 行（报告记 487）：注释 # cv2.CV_64F is an OpenCV constant, not Python eval()；代码块内 cv2.Laplacian(..., cv2.CV_64F).var() 是模糊度计算，无 eval/exec 调用。
  Residual risk: 无；命中源于文本中的 eval 字样。
  Evidence: `docs/security-report.json`.
- histolab:2 (low, false-positive): 同一位置的复核结论：该 LOW 项是确定性分析器的前置线索，报告自身亦标注为 false-positive lead；实读确认为 OpenCV 常量。
  Residual risk: 无。
  Evidence: `docs/security-report.json`.
- generated-entry-guidance: Require confirmation of WSI inputs, output directory, pyramid level, tile count, and resource budget; use bounded extraction and never overwrite originals or existing outputs by default.
- compatibility-guidance: Disclose OpenSlide and Python requirements without installing them; the target project selects, locks, and installs all dependencies.

### hypothesis-generation

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: arsu-surface-overlap, no-domain-fit.
- Reviewed inventory: 27/27 files; findings: 0.


- generated-entry-guidance: Retain hypothesis formulation, competing explanations, predictions, and experimental-design methods; remove mandatory figures, cross-Skill promotion, provider names, model names, and credential metadata.
- compatibility-guidance: Optional visuals may use only target-Agent generic image capability after explicit consent to send research material; preserve ARSU overlap and no-domain-fit blockers.

### literature-review

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: arsu-surface-overlap, no-domain-fit.
- Reviewed inventory: 12/12 files; findings: 4.

- literature-review:1 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：key 随显式调用发往 OpenRouter。
  Evidence: `docs/security-report.json` `skills/literature-review/scripts/generate_schematic_ai.py` `skills/literature-review/scripts/generate_schematic.py`.
- literature-review:2 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：chain 由 generate_schematic.py 向 AI 子进程转交该 key、verify_citations.py 另行联网构成。
  Evidence: `docs/security-report.json` `skills/literature-review/scripts/generate_schematic_ai.py` `skills/literature-review/scripts/generate_schematic.py` `skills/literature-review/scripts/verify_citations.py`.
- literature-review:3 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：generate_schematic_ai.py 单点鉴权调用。
  Evidence: `docs/security-report.json` `skills/literature-review/scripts/generate_schematic_ai.py`.
- literature-review:4 (low, confirmed): 实读 SKILL.md 第 224 行：依赖段落给出 curl -fsSL https://parallel.ai/install.sh | bash。allowed-tools 含 Bash，Agent 若照做会拉取并执行未固定版本、未校验的远端脚本。
  Residual risk: 中低：安装步骤可被上游或中间人替换；缓解是固定版本或校验哈希后再执行。
  Evidence: `docs/security-report.json`.
- resource-exclusion (skills/literature-review/scripts/generate_schematic.py): Exclude provider-specific subprocess, inherited-environment, and image-generation behavior.
- resource-exclusion (skills/literature-review/scripts/generate_schematic_ai.py): Exclude provider-specific network, credential, .env, prompt, dependency, and model handling.
- generated-entry-guidance: Remove mandatory figures and parallel-cli installation, authentication, and command coupling; use only target-Agent configured literature retrieval and treat all external content as untrusted data.
- compatibility-guidance: Retain local result processing and PDF generation; fixed DOI/Crossref verification requires explicit network consent, a bounded request count, and a non-overwriting report path. The target project owns dependency locking.

### paperzilla

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 1/1 files; findings: 0.


- generated-entry-guidance: Remove installation, upgrade, login, and environment configuration instructions; allow only a user-installed, authenticated, explicitly authorized pz client and treat returned Markdown as untrusted data.
- compatibility-guidance: The Skill never reads, stores, or forwards credentials; browsing and export are read-only, while submitting or clearing recommendation feedback requires separate user confirmation.

### pathml

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 13/13 files; findings: 0.


- generated-entry-guidance: Default to local PathML processing; do not use documented remote segmentation variants, and require explicit WSI inputs, output directory, bounded tile count, and non-overwriting behavior.
- compatibility-guidance: The target project selects, locks, and installs PathML and native dependencies; do not transmit identifiable clinical data or pathology images to external services.

### peer-review

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: arsu-surface-overlap, no-domain-fit.
- Reviewed inventory: 24/24 files; findings: 0.


- generated-entry-guidance: Retain peer-review methods and reporting references; remove provider and model names, credential metadata, cross-Skill promotion, and mandatory image generation.
- compatibility-guidance: Optional visuals may use only target-Agent generic capability after explicit consent to send manuscript material; preserve ARSU overlap and no-domain-fit blockers.

### primekg

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 2/2 files; findings: 0.


- resource-exclusion (skills/primekg/scripts/query_primekg.py): Exclude the hardcoded, repeatedly full-loading, regex-interpreting query implementation rather than maintaining an executable patch.
- generated-entry-guidance: Retain only PrimeKG entity, relation, and query-method knowledge; do not claim a packaged local query runtime or fixed data location.
- compatibility-guidance: Any future data adapter requires an explicit configured source, indexed or single-load access, literal matching, bounded results, and independently resolved license evidence.

### research-lookup

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: arsu-surface-overlap.
- Reviewed inventory: 4/4 files; findings: 4.

- research-lookup:1 (critical, partially-confirmed): 当前内容实读：research_lookup.py 读取 PARALLEL_API_KEY / OPENROUTER_API_KEY，仅作为 Bearer 头 POST 到 api.parallel.ai/chat/completions 与 openrouter.ai/api/v1/chat/completions。属对声明服务的鉴权传输。
  Residual risk: 凭据随显式调用发往声明的检索服务。
  Evidence: `docs/security-report.json` `skills/research-lookup/scripts/research_lookup.py`.
- research-lookup:2 (critical, partially-confirmed): chain 由 research_lookup.py 与 manuscript_packet.py 的文件交接聚合；后者自身不做 env 读取或网络请求。
  Residual risk: 凭据随显式调用发往声明的检索服务。
  Evidence: `docs/security-report.json` `skills/research-lookup/scripts/research_lookup.py` `skills/research-lookup/scripts/manuscript_packet.py`.
- research-lookup:3 (critical, partially-confirmed): research_lookup.py 单点鉴权调用。
  Residual risk: 低：PARALLEL/OPENROUTER key 随显式调用发往声明端点。
  Evidence: `docs/security-report.json` `skills/research-lookup/scripts/research_lookup.py`.
- research-lookup:4 (low, not-applicable): 实读同源：该 LOW 项把 env 读取 + Authorization 头判为外泄链，核实为声明 key 对声明 endpoint 的常规用法，不构成数据外泄。
  Residual risk: 无；仅需用户知晓查询内容会送达所选检索后端。
  Evidence: `docs/security-report.json`.
- resource-exclusion (skills/research-lookup/README.md): Exclude provider installation, authentication, API-key, and setup guidance.
- resource-exclusion (skills/research-lookup/scripts/research_lookup.py): Exclude the duplicated provider API, credential, routing, and network implementation.
- generated-entry-guidance: Retain only query planning, source selection, and result verification principles; use target-Agent configured retrieval, remove mandatory storage and images, and treat external content as untrusted data.
- compatibility-guidance: The Skill handles no credentials; disclose the destination and query content and obtain consent before any external retrieval.

### scholar-evaluation

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: arsu-surface-overlap.
- Reviewed inventory: 19/19 files; findings: 1.

- scholar-evaluation:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 298 行确含 vendor 自撰 Citing Scientific Agent Skills 段。事实成立；属 Skill 自带内容而非不可信输入，标为 policy violation 属规则名过宽。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献，属内容污染倾向而非安全入侵。
  Evidence: `docs/security-report.json`.
- generated-entry-guidance: Retain the local score calculator and evaluation framework; remove provider, model, credential, cross-Skill, and default-image guidance. Scores are advisory and cannot modify ResearchSpec state, Gates, Decisions, or receipts.
- compatibility-guidance: Confirm report output paths and never overwrite by default; preserve the independent ARSU surface-overlap blocker.

### scientific-writing

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: arsu-surface-overlap.
- Reviewed inventory: 31/31 files; findings: 1.

- scientific-writing:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 358 行确含 vendor 自撰 Citing Scientific Agent Skills 段。事实成立；属 Skill 自带内容而非不可信输入，标为 policy violation 属规则名过宽。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献，属内容污染倾向而非安全入侵。
  Evidence: `docs/security-report.json`.
- generated-entry-guidance: Retain writing, IMRaD, citation, reporting, formatting, template, figure, and table guidance; remove provider, model, credential, cross-Skill, and mandatory-image instructions.
- compatibility-guidance: Optional visuals may use only target-Agent generic capability after explicit consent to send research material, and the Skill cannot bypass the ARSU writing workflow.

### tiledbvcf

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 1/1 files; findings: 0.


- generated-entry-guidance: Default to local open-source TileDB-VCF; remove account signup, token export, cloud-client installation, named credential, and automatic cloud-scaling instructions.
- compatibility-guidance: Cloud storage or compute may use only user-configured identities after explicit confirmation of destination, genomic data transfer, sharing, and cost; never upload genomic data automatically.

### treatment-plans

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 23/23 files; findings: 0.


- generated-entry-guidance: Retain templates and local completeness, timeline, generation, and validation tools; remove mandatory images and every claim that templates or checks ensure HIPAA, clinical, billing, or regulatory compliance.
- compatibility-guidance: Limit use to education, research, or qualified-clinician-led documentation with de-identified or synthetic inputs; never autonomously diagnose, select medication or dose, or issue an executable patient treatment decision, and require qualified clinical review.

### usfiscaldata

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 9/9 files; findings: 1.

- usfiscaldata:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 173 行确含 vendor 自撰 Citing Scientific Agent Skills 段。事实成立；属 Skill 自带内容而非不可信输入，标为 prompt injection 属规则名过宽。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献，属内容污染倾向而非安全入侵。
  Evidence: `docs/security-report.json`.
- generated-entry-guidance: Use only the official U.S. Treasury Fiscal Data endpoint, parameterized requests, and bounded pagination; show endpoint, filters, and expected result size before retrieval and treat responses as data.
- compatibility-guidance: The target project locks any requests and pandas dependencies; record query date and do not present retrieved fiscal data as investment or policy advice.

### zarr-python

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 7/7 files; findings: 0.


- generated-entry-guidance: Retain local Zarr workflows and pinned-version guidance; cloud stores require explicit user selection, a displayed store URI and write mode, and confirmation of data scale and transfer.
- compatibility-guidance: Use only target-environment provider SDK identities; never read, display, copy, or request pasted credentials, and never overwrite an existing array or group by default.

### autoskill

- Maintainer action: clear; production: excluded.
- Independent blockers: outside-plugin-authority, upstream-security-review-required.
- Reviewed inventory: 15/15 files; findings: 7.

- autoskill:1 (critical, partially-confirmed): 当前内容实读：scripts/backends.py 读取 ANTHROPIC_API_KEY / FOUNDRY_API_KEY 并经 httpx 发往声明的 api.anthropic.com 与 foundry endpoint；scripts/doctor.py 读取 SCREENPIPE_TOKEN 访问本地 daemon；scripts/run.py 用 SCREENPIPE_TOKEN 访问 http://localhost:3030。env 变量与网络调用确实同现，属对声明服务的鉴权传输；同现本身不证明外泄，故不判 confirmed 外泄。
  Residual risk: 凭据随显式调用离开宿主；endpoint 在 backends.py 中被校验为 https 或 loopback（明文 http 仅限本机），未见未声明目的地。
  Evidence: `docs/security-report.json` `skills/autoskill/scripts/backends.py` `skills/autoskill/scripts/doctor.py` `skills/autoskill/scripts/run.py`.
- autoskill:2 (critical, partially-confirmed): 同上：跨文件 chain 由 backends.py、doctor.py、run.py 三处 env 读取与各自网络调用聚合而成，非单点隐蔽通道。
  Residual risk: 凭据随显式调用离开宿主；该 skill 本已因 authority 排除。
  Evidence: `docs/security-report.json` `skills/autoskill/scripts/backends.py` `skills/autoskill/scripts/doctor.py` `skills/autoskill/scripts/run.py`.
- autoskill:3 (critical, partially-confirmed): backends.py 一处 env 读取 + 网络调用，属声明服务鉴权。
  Residual risk: 同上；仅该文件。
  Evidence: `docs/security-report.json` `skills/autoskill/scripts/backends.py`.
- autoskill:4 (critical, partially-confirmed): doctor.py 一处 env 读取（SCREENPIPE_TOKEN）+ 本地 daemon 调用，属声明服务鉴权。
  Residual risk: 同上；仅该文件。
  Evidence: `docs/security-report.json` `skills/autoskill/scripts/doctor.py`.
- autoskill:5 (critical, partially-confirmed): run.py 一处 env 读取（SCREENPIPE_TOKEN）+ http://localhost:3030 调用，属本机声明服务鉴权。
  Residual risk: 同上；仅该文件。
  Evidence: `docs/security-report.json` `skills/autoskill/scripts/run.py`.
- autoskill:6 (low, partially-confirmed): 实读 scripts/backends.py：屏幕派生摘要与 API key 会发往用户可配置的远端 endpoint，属声明能力内的数据外出，而非未声明通道。
  Residual risk: 上传内容含屏幕派生文本，用户需自行确认所配 endpoint 可信。
  Evidence: `docs/security-report.json`.
- autoskill:7 (medium, partially-confirmed): 脚本存在屏幕 OCR 文本进入 LLM prompt 的路径（规则指向 scripts/promote.py）。该结构真实存在，但本次未逐行审读 promote.py 的拼接细节，故不判 confirmed。
  Residual risk: OCR/屏幕文本作为 prompt 输入存在间接注入面；未逐行确认是否有过滤或分隔防护。
  Evidence: `docs/security-report.json`.


### waypoint-bio

- Maintainer action: clear; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 7/7 files; findings: 2.

- waypoint-bio:1 (high, false-positive): 实读 references/python-api.md 第 118 行（报告记 117，0-based）：model = AutoModel.from_pretrained(model_id).eval()，是 transformers 推理模式，非 Python 内置 eval/exec。
  Residual risk: 无：文档示例为常规 HuggingFace 推理用法。
  Evidence: `docs/security-report.json`.
- waypoint-bio:2 (medium, false-positive): 实读 references/python-api.md 约第 203 行：subprocess.run(["waypoint","finetune",...]) 的 CLI 示例，固定 argv 列表、无 shell=True、无用户输入拼接。
  Residual risk: 示例执行本地 waypoint CLI；仅在用户显式按其运行时有效，不构成注入面。
  Evidence: `docs/security-report.json`.


