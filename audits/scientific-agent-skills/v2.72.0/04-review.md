# Scientific Agent Skills Extension Anchor Review — v2.72.0

## Registry And Domain Review

- capability entries: 68
- profile entries: 68
- Scientific Agent Skills 领域分配由 `src/plugins/domain-catalog.json` 自动镜像
- 每个领域只包含其 reviewed raw Skills 对应 extension
- extension capability IDs 与 raw Skill IDs 不冲突；与 bundled capabilities 不冲突。

## Package Review

| capability_id | package tree SHA-256 | profile SHA-256 | tool files | tools byte-identical | required fields bound |
|---|---|---|---|---|---|
| `plugin-scientific-agent-skills-13c-metabolic-flux` | `1f85073aa4a7673493863e5bdb36fdb1273ef498ac58a9ea3875968a8ce7fd9a` | `155c917b080bbaa60c41763eb823118d33315cb88c103d867698907f088173ec` | 15 | yes | yes |
| `plugin-scientific-agent-skills-aeon` | `c8e97b825fe5fe8f6b41f7080432104bee3e064d321410402343112be4b4c376` | `ad7fc7838bbad822dfa343750222de1efd06920ace7d296f298aa1e56cd552e4` | 11 | yes | yes |
| `plugin-scientific-agent-skills-analytical-method-validation` | `d63c4e0e945ec27d0fa8206ed74e5392defd984541ea2afc4e770d3861b70c85` | `75823d3c7ebae81eb094b05f3312d38a6c8ce1e51e8a723d1e79a04d23ff7df6` | 16 | yes | yes |
| `plugin-scientific-agent-skills-astropy` | `5797806104533f1babe959ea63687e65e7269a261dd4c27a5736ec12cb16d5ae` | `de8cdadeda6f83558e71ed75352921c8b34d62f481ec4550589385b2782dc66e` | 8 | yes | yes |
| `plugin-scientific-agent-skills-benchling-integration` | `36936ca87e58ccd95841ba2f2b65b6b04eb48833a4fff2db7b2ea514b8182614` | `f6fca0c475542e946d654e56f3b49f18f81eab57a4fd747d04f36d1ebf4c3724` | 5 | yes | yes |
| `plugin-scientific-agent-skills-cantera` | `8f527b144c9460a5ad61b7ace430d90d017a759b68e3f2ae31706daf04590dc7` | `bb9e24a87e824a3d21c477118afe7d191ff4894f579735946d7a029499b261b6` | 3 | yes | yes |
| `plugin-scientific-agent-skills-cellprofiler` | `bc7a962eb3ca7afbeee581af0fabb86cb4685b8a735a8688df2d565941c22cd7` | `8a378ae25988d6750c2c74471c69eefc234eb053e58d05e345715e61e253b1aa` | 3 | yes | yes |
| `plugin-scientific-agent-skills-cirq` | `1e0ace91595ccd14342eb19069f24a214e0f5b778067ba281d13db68461c0423` | `75619696bec6a10fc806d78f5c602bfec3b27541b06ef58a49b67439adee7ac6` | 7 | yes | yes |
| `plugin-scientific-agent-skills-datalad` | `3669ecad713d50d80b1f4b68b5cf3835ae1fdd5d9a5518388b5b551a55df393c` | `db01add65406090cfe83d57561e5c388bda3f8f04a5d6307f384c9a89f32dd44` | 3 | yes | yes |
| `plugin-scientific-agent-skills-flowkit` | `4e2e6a4cd673a79973edb696ae0e6ef5737ecb34f9a23f5d6a07d99fa0c69179` | `9499f5b664417c30469836a5a0dc744fc9e05c8b6a4f07239c174c3c4ab3a039` | 3 | yes | yes |
| `plugin-scientific-agent-skills-fluidsim` | `e458ffa952c72468e15e76c41b17845d5b346587c74b75087b0871ad6ad8a48e` | `17c28bbf59f832e09d781da0a327176499cd93afb9cad4cb71c1cd3ec81a08f8` | 16 | yes | yes |
| `plugin-scientific-agent-skills-generate-image` | `2bf5ece4d19b0249124fbd7fb075788ec352c4eac7041eaa1f2e4aea668fcec8` | `34818885084cfb22cc86319bdbb07454ad7eee78ac0320a1f4fecef1bc912c60` | 0 | yes | yes |
| `plugin-scientific-agent-skills-genomic-coordinates` | `ee9328c03f9f14badab06a542d92091005a387a166107687f8d8d592991a497e` | `0ca55c88fa7bcd6f50efd09788b0239a39e0fdfcbc700a6c0a8427a6341d77f2` | 9 | yes | yes |
| `plugin-scientific-agent-skills-geomaster` | `640d7207704360f791bdaee5d9e718a5ed03e1f47a99d99fdfd8cee1e5aa6677` | `dfaf987eafd72137c28c62fefca7f365b1be73a3181dec427de384b8c8f769a7` | 17 | yes | yes |
| `plugin-scientific-agent-skills-geopandas` | `5cd7f25a5f7509cbaf98d5c79253b35946f21d12e6fd4c6abae91bb828d23f32` | `1582a7f68d0239f480858fe1289f111d83fa97804bf6474973a6dc294d2af2a4` | 13 | yes | yes |
| `plugin-scientific-agent-skills-ginkgo-cloud-lab` | `c59b55b2760bb96e30c2e91fd0d842001210f268572a7effdd0e4c17dee9bfd1` | `c998e9e781860d915bc3e0a052e67bd396549855366eafac6d5dfcf019331c90` | 0 | yes | yes |
| `plugin-scientific-agent-skills-infographics` | `dc3216693b31e14ad8e68003f94b30cb3753dd6ba546d2846bfa224a24b4f1c1` | `bc9f0ddfe578cc8497b5158901165cb722ae534a8a3d4c3bb692989aa930d33b` | 4 | yes | yes |
| `plugin-scientific-agent-skills-lab-hardware-cad` | `8f79c106d04a3eef59666ed30679114140b12044748e2e54cd6234f5fa68501b` | `ba24aefbd1829bde1c09cddf701a3b6b8456d7d0842b8134b4b0a80ef7e30e24` | 12 | yes | yes |
| `plugin-scientific-agent-skills-labarchive-integration` | `0205ca0c5f56c05e5938f5e1625531e7d4b26b3b0b5b0623a2053af2d8d6588c` | `7eb0da74b562733967766c3e9f5143248559899d8782ab398167a150a43ee8c5` | 7 | yes | yes |
| `plugin-scientific-agent-skills-latex-posters` | `bca3e7d6cecddbc76269a8635c7e8d7a4f42f38acd1266783ad65bc99df527f2` | `304dd3704ac953337d5ce1a20acc86beb79a6ac1b0b6900aacfe8fa04e8fdc8b` | 13 | yes | yes |
| `plugin-scientific-agent-skills-liteparse` | `c318fcf9ed2c3ad0e6ef5a4a56b2a37e978be724e0450402e167d8d993a84f3e` | `2239de72c8cad062be4703d09d6f9ef0c1af3790ced53fcc0c9ebca125af9f32` | 6 | yes | yes |
| `plugin-scientific-agent-skills-marine-carbonate-chemistry` | `39102d2912efbcf0949b520f2244985e4129a725c092e058596a5197e315db4d` | `aab0881ddabc376de3e07bb61a429a495726f0c96f85fad5e96256887c6beb78` | 3 | yes | yes |
| `plugin-scientific-agent-skills-markdown-mermaid-writing` | `6382baaf29fde1cfdfb979218fb5c981046bdf454c6bdc9fc37370a8d9e56123` | `5572012b92e45d994596c779312299ef2945f4d455acd96c48556a07839d963b` | 37 | yes | yes |
| `plugin-scientific-agent-skills-markitdown` | `d09a57b33171a751767ba5a87983d821ba3d91f5821868837cff9e92ad3c747b` | `a22414be86a094d0865e586bb227e2944e26168c99bdaaf8d1e876cd6834913a` | 10 | yes | yes |
| `plugin-scientific-agent-skills-matlab` | `67b95b1bcf6511d9607a592e459bb280d3e95899bc105f0fe1db64f9de9cd2ba` | `6a04bc6aae10be04145feb58a7a1fd4c384bd38afc367f4cca5fefc8fa9f6e1d` | 19 | yes | yes |
| `plugin-scientific-agent-skills-matplotlib` | `0a6c02ca4926487763614a68c659aed809a43756427e89a328e2efcd2da2fd4c` | `1c69886f19bbfae50119612abf6e9b1cebaca32be0879420b5d6e502f142b1b9` | 6 | yes | yes |
| `plugin-scientific-agent-skills-modal` | `d35ef914390ca691f26015085321be5cfac691f1603575b9f3a742cc1c4d9afb` | `ea54f92df7ce3c3f9ab281a7dcb258443e7b835fed03b33aa7580e23ce57999a` | 11 | yes | yes |
| `plugin-scientific-agent-skills-networkx` | `dd3d823324362530383df6e8c2122d5633be9acde11687030c9384f8d9a8dfff` | `7683f47da83ebc03915b70979176d9f1cf12a14dae44067e08b66128528dabca` | 6 | yes | yes |
| `plugin-scientific-agent-skills-nmrglue` | `cbad26f5bfa233d10ddd0ca88634254dde2222e690fa0a5979baeab951b7ca22` | `2d22774e82288ac54c6a633fb9f776c089bcdd7bb85462d4eead30a4daa0ff2e` | 3 | yes | yes |
| `plugin-scientific-agent-skills-nwb-conversion` | `8895f143b44bfbf677c8248fcd708aa32018f5918a4f177b0af676ceb0c1827c` | `cde56d6e36e601a7f72b47e4d26ace8f5c882ce826e75b3b78818a66b6bc6afe` | 4 | yes | yes |
| `plugin-scientific-agent-skills-ontology-term-resolution` | `318dedd3e48e71a35da45d7eae6b712534050c405d8564c723afe24fe819dbf9` | `7dd2fbaafd7f7a719d37d0decf707507634806165149ca8df0fde7059a3fe0b7` | 11 | yes | yes |
| `plugin-scientific-agent-skills-open-notebook` | `9e52a4629ce24a2d611a97c51ce0657560bc7faad8e1623e0ffc9b621073c787` | `3867eb720a6f8ea480a339fa201ca8fafd63bfe62bb418714673d4f151015ca8` | 8 | yes | yes |
| `plugin-scientific-agent-skills-opentrons-integration` | `d15f42875950b680b641dce0a7d76e5ef09c5d4e55cbf5b121a6ba12693092ef` | `ddcbb4f2ba652b7b38d7520122864082b98de52e37c1092c239fb8b2e3bc9761` | 15 | yes | yes |
| `plugin-scientific-agent-skills-optimize-for-gpu` | `568a18652bcd5c0e9fd8abcfc94db0d19dd099bdaf6365a8c3a66343339a80a5` | `59c423123b60b0742986e8f3e70aea876c2598c660864367e9e074828ad1d40d` | 15 | yes | yes |
| `plugin-scientific-agent-skills-pacsomatic` | `81a81f6f7ca0ef83e3b3c2a935986a822c8a39abf38efdbc7d4c5e30cbbe55fe` | `9b0652244a02885ddc1b1e13a18527502db8699ab7985a845a99bcf49aa93494` | 3 | yes | yes |
| `plugin-scientific-agent-skills-parallel-web` | `0dc9148cd2527b8eaaf633fd8ad5dbf0f45bfb93854d8ae734b3567adad06ccd` | `588cf7d466fbddcaa869951ab39bddd1872661e591ff629a86cfc95e0b63785e` | 0 | yes | yes |
| `plugin-scientific-agent-skills-pennylane` | `7be1a8fdcc930ed5ef352d5e65e51175906e231b1e3867ddfb460a34b6b670a7` | `a2386da94735ba7a2627e2ad7bcd69ff580d81fadaa9cc4507d37d7fd3a0c643` | 7 | yes | yes |
| `plugin-scientific-agent-skills-pptx-posters` | `54d9101d9ae30b19534d4c2b26267a79734a63e894a788071895b72eff5dfb51` | `c3e311f6421817fb4ff8672b9b376c0b0eea6b8c30ed0cc21f8d80a1be66a3f7` | 20 | yes | yes |
| `plugin-scientific-agent-skills-protocolsio-integration` | `1d7e719a7b23db901528695a60d717955d5518761fc177fd8b13f3810b762f59` | `6562b92e58a617e6b4301d07f1e41fd7cd6d19fbf078880122393bb3dd61ceb5` | 14 | yes | yes |
| `plugin-scientific-agent-skills-pufferlib` | `30e8f82c01490e46f100a3dc83a4ba7db36161b7ef51caaae6ba85595ec5c449` | `c8c98524eb94b34d1e21b068a188e372efb4afc1c766b2f24e77f2b714333f20` | 15 | yes | yes |
| `plugin-scientific-agent-skills-pybamm` | `fc17180c72aec8eb1a075eebe66b1106a57dccd9319adfe7bd3e190254c2f248` | `21ebccafb328f8cfe93fac2dd800fb8068786f10b37e31979a8d245733ef9b93` | 3 | yes | yes |
| `plugin-scientific-agent-skills-pycalphad` | `f9ea0c0323f5fd03cd46f939cee0abd199e2b0c12d342e11c26bc53c29b43360` | `63018f85e4b45e2130b79b7c6624463d25447f5b886453cebe213ae050f41953` | 4 | yes | yes |
| `plugin-scientific-agent-skills-pylabrobot` | `a1e8f4c2f978cfa701d0090edece53409d3fa7280d16917cd0a0bfbbab5a9aae` | `e0518ed56165f6e2819f7b550b616141efa69ad4d3856bed55c596f4402c6b56` | 15 | yes | yes |
| `plugin-scientific-agent-skills-pymatgen` | `807ac7c9968615ec3ebf5b55060c9b29dc7c1c283bf4907539083ec2e62e332c` | `9f7622e1541ff5828cec6dfbb5596b9eb0665bd24aa1a1d1e699261f53b4e0a4` | 14 | yes | yes |
| `plugin-scientific-agent-skills-pymoo` | `8c3a1db7308edc66209fedad7e961767fc21b806b37161f3c3c4d989e7af2a01` | `7afdfecb8797e42853792e2994df6326c6c0bbd0d38dfc1c6005e8468a418dc8` | 13 | yes | yes |
| `plugin-scientific-agent-skills-pytorch-lightning` | `9944c8be35242447189039dfb9598db3f4a49a37c1badfda6cbd59d827b76916` | `1ecde326a531465da224641af07f437a7cb1e42659cb51d700c0ac31e27c1431` | 10 | yes | yes |
| `plugin-scientific-agent-skills-pyzotero` | `13762aad79640aa2768704434376eb333b40ede934ac590bd686c591d82e307a` | `a8a98a066f691a4cb89bd3ca27c7b82e48bf83b32bc9c8f37680a4a5fc2eba89` | 14 | yes | yes |
| `plugin-scientific-agent-skills-qiime2-amplicon` | `a3fc2bbe03c2016f1d2becd8fda3ed4d29b50fcfed2de883e5e6bfdb24fa536f` | `b5ac02d26c1dbe7e7ef01e9efe4a645fcf052aebe377f7824ba75db7874421bb` | 2 | yes | yes |
| `plugin-scientific-agent-skills-qiskit` | `cb3288fcea02b7b49d5fd9f2f2f346a13f10af0fa1cb2d9f9e236f85b280ffd3` | `2db490a27dea3ba28c27523349315384788e28dd99554e5a158c8a63dc3e25ac` | 14 | yes | yes |
| `plugin-scientific-agent-skills-qutip` | `8e7acda429fe312a3963c79dd35ea6175546f9884513c14024571be075a34b32` | `624dc5d1d20f2ac8c12a4875184164d5ab1b3ba7249812d32119e5f64233287b` | 12 | yes | yes |
| `plugin-scientific-agent-skills-relion` | `b4c000877d1e62affb7fe723d4251bb0e8439cab9b2fda72c0b867402d4b2ee8` | `fa226e01aca6689b68fb9bd9289527e2a69814a70f05d64295a69726efb079f7` | 3 | yes | yes |
| `plugin-scientific-agent-skills-relsa-severity-assessment` | `84f6609a14c313c0c771329f9cf5e77f18b1002a63eca8a7bc1e0bc1f947e5da` | `09423506c6e4152eb3f6e3562e31f5d9f3fec3ae45318aa4768aa235611259f6` | 8 | yes | yes |
| `plugin-scientific-agent-skills-scientific-schematics` | `115ac9c66c796d1cff9a2bf243d52b9b8f30eeb03ac39fee9e120fb3cb105b92` | `da86d124d6c428cd69b82cae08f6f9d2a8655afa5e87d405a7b72f5ef9c04cb6` | 1 | yes | yes |
| `plugin-scientific-agent-skills-scientific-slides` | `00f0f961b40a190c5abcec6ddba685e5fbbeb0f9431e76adb6448dddda5c3148` | `b255cb6e4f4678001e9b73c75e1acb6281fb840e991c7d3ac4ac5b2cfbe811b5` | 18 | yes | yes |
| `plugin-scientific-agent-skills-scientific-visualization` | `13e72fb390fc7070ebeeb2bc87e98f2ecfe7fab6bda18048da2b1441e9fd7fb7` | `8b59a777792a5ff48d2ef1119d18bc7ab3fc484553df0203a98f9ec5f358c7f5` | 17 | yes | yes |
| `plugin-scientific-agent-skills-scikit-learn` | `e53735153ee3e0ed605decd2190ca3354b9e44f8dcb72e366c361cda6d73953d` | `0ff407485fd2203d9e95089643f6e9a692d363c107007a85648c93b4a52216e5` | 10 | yes | yes |
| `plugin-scientific-agent-skills-seaborn` | `b45992902793a2f1fe1e854a5bb16e02386ea5417a9be588aa0933df997dbf5c` | `7c29b46aa3161607712e7e7129422582288dc2ee41e18b7542e52d056c64cd36` | 7 | yes | yes |
| `plugin-scientific-agent-skills-shap` | `f48aa634138b90c6274dce1c9128a5715aa054551c362e30665b30da6597b0fb` | `f7bf9cd92797fc89b38a363d6a158e31b13186889c6486dbc17a7fe8527b0f2e` | 9 | yes | yes |
| `plugin-scientific-agent-skills-simpy` | `531468e749b544457614aab7fe20a7691548d0329b6d73342b515893037b91d4` | `e9cbe4f2c762897c7cef7cc343429f4fd4d47f2ac23af20698d05becf9b04523` | 15 | yes | yes |
| `plugin-scientific-agent-skills-stable-baselines3` | `6c0c5b96501f66b90c46edb25cfb63fc55adbce75910fecba27deab2b88fcccc` | `3b60cb4d5f0a84726a04215faa78a1fb82174c3358757c244450c92c8a602928` | 7 | yes | yes |
| `plugin-scientific-agent-skills-sympy` | `32a1fb2ad63287c4be475429b052b29629104615748d37257347323d0b5c77ce` | `d2b5683ca7e9ee1249e408c4ccc971b17d6ac6f1cdbf55a9be2dadec774f1df6` | 7 | yes | yes |
| `plugin-scientific-agent-skills-tellurium` | `35c17290deac9c8147b977fe543c8448285d612eb4165ac91f83d483f7d710f4` | `d38dcfae0a78bcc07ca52261423a2461f99025bf5a3b532c8db7bd906cd3f100` | 4 | yes | yes |
| `plugin-scientific-agent-skills-timesfm-forecasting` | `8f670d8123e64743926fda8117a1a1e9d318c71c02330ebfcacc06d79cf506fd` | `1edf09bf1411d55bcc35dee938d93cf14d71079bf9c0630500bb614d083bd99a` | 20 | yes | yes |
| `plugin-scientific-agent-skills-torch-geometric` | `3770ed20b90703d204878abb604461a68dcf899eda4bec1d57d8ed43a4a566c1` | `c03a4b5fdba3fc0ba90b067a05f97935d2deb66f33e81854b543257211e93b7e` | 7 | yes | yes |
| `plugin-scientific-agent-skills-transformers` | `ea8b64b7bff4c313e4ba8b05d86dab14d36d85e0c18bef8f254ed2b3a672543f` | `e4536afa73bd2fd3c6a4c51320c01c8a21b0057bf529b496586058ffea815013` | 6 | yes | yes |
| `plugin-scientific-agent-skills-umap-learn` | `bf2783a07e5716d5225f280744f45d85a206eec9f76c34fa8253c67472b1ea55` | `5a25f9a251f9a2e76db1f439033e37c7d0a7bccf0a96d262c430755f2c94e540` | 1 | yes | yes |
| `plugin-scientific-agent-skills-uncertainty-and-units` | `421640b3986d25a0078caf40086d0b7b316f9bbc19b29485a999dd959b333e50` | `8a2d27739590da7fdd235da54ee8ef7d6fb61f4f473fe1cb082a3b05382d0338` | 14 | yes | yes |
| `plugin-scientific-agent-skills-venue-templates` | `68ab2f8eece0e3f76546c40e6cc69804a478cc6f0cdf1a54e2f1d0a7c550152c` | `afc29cf1af32b733ef9d1c0dcabfa6e07d7fccd19d8679b21803191e14f77039` | 31 | yes | yes |

## Machine Review Artifact

| artifact | path | sha256 |
|---|---|---|
| extension review | `audits/scientific-agent-skills/v2.72.0/artifacts/extension-review.json` | `d9e05f378bde286ade9ce3e452c94ff2ab55245a8fb54cd6a29673840c20aed0` |

## Human Confirmation

- [x] 68 个上游语义义务均由 extension SKILL 或 graph profile 承接。
- [x] extension SKILL 不含 next-node / next-phase / agent-team orchestration。
- [x] 命名、registry、审计记录、锚点 manifest 身份一致。
- [x] Agent 语义审阅见 `05-semantic-review.md`。

## Manual Security Decisions

Structured source: `src/vendor-converters/scientific-agent-skills/security-review-decisions.json`.
Current report observations and retained curation targets are reviewed separately from admission.

### fluidsim

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 17/17 files; findings: 0.


- generated-entry-guidance: Identify FluidSim as an independently maintained upstream framework and preserve ResearchSpec vendor provenance without implying official affiliation.
- compatibility-guidance: Describe required FluidSim, FFT, and MPI dependencies without installing them; require the target project to pin and provision its own environment.

### geomaster

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 18/18 files; findings: 1.

- geomaster:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 369 行确含 vendor 自撰 Citing Scientific Agent Skills 段。事实成立；该段属 Skill 自带内容而非不可信输入，标为 prompt injection 属规则名过宽。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献，属内容污染倾向而非安全入侵。
  Evidence: `docs/security-report.json` `skills/geomaster/SKILL.md`.
- generated-entry-guidance: Narrow activation to explicit geospatial, GIS, remote-sensing, or Earth-observation work and treat all credentials and paths in examples as user-supplied data.
- compatibility-guidance: Do not install the documented GIS stack automatically; require project-pinned dependencies and user confirmation before invoking external GIS programs or authenticated services.

### infographics

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 8/8 files; findings: 3.

- infographics:1 (critical, partially-confirmed): The current provider utilities use a selected environment and a declared credential for external generation. This supports the credential and outbound-material surface of the historical finding.
  Residual risk: Excluded provider resources stay upstream. Any optional rendering requires separately authorized target-Agent capabilities.
  Evidence: `docs/security-report.json` `skills/infographics/scripts/generate_infographic_ai.py` `skills/infographics/scripts/generate_infographic.py` `skills/infographics/SKILL.md`.
- infographics:2 (critical, partially-confirmed): The current provider utilities use a selected environment and a declared credential for external generation. This supports the credential and outbound-material surface of the historical finding.
  Residual risk: Excluded provider resources stay upstream. Any optional rendering requires separately authorized target-Agent capabilities.
  Evidence: `docs/security-report.json` `skills/infographics/scripts/generate_infographic_ai.py` `skills/infographics/scripts/generate_infographic.py` `skills/infographics/SKILL.md`.
- infographics:3 (critical, partially-confirmed): The current provider utilities use a selected environment and a declared credential for external generation. This supports the credential and outbound-material surface of the historical finding.
  Residual risk: Excluded provider resources stay upstream. Any optional rendering requires separately authorized target-Agent capabilities.
  Evidence: `docs/security-report.json` `skills/infographics/scripts/generate_infographic_ai.py` `skills/infographics/SKILL.md`.
- resource-exclusion (skills/infographics/scripts/generate_infographic.py): Exclude the provider-bound wrapper because it copies the full process environment and forwards credentials to another script.
- resource-exclusion (skills/infographics/scripts/generate_infographic_ai.py): Exclude provider-specific network, credential, research-injection, persistence, and unbounded-iteration business logic.
- generated-entry-guidance: Retain the reviewed infographic design method but express optional generation generically through the target Agent's configured text/image model capability, without naming a provider or model and without reading, storing, or forwarding API keys.
- compatibility-guidance: Require explicit user consent before sending prompts, data, or images to any externally configured model; treat retrieved material as untrusted and keep cost limits under the target Agent's control.
- resource-exclusion (skills/infographics/references/iterative_refinement.md): Exclude provider-specific, credential-dependent or execution guidance outside the approved procedure.

### latex-posters

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 17/17 files; findings: 3.

- latex-posters:1 (critical, partially-confirmed): The current provider utilities use a selected environment and a declared credential for external generation. This supports the credential and outbound-material surface of the historical finding.
  Residual risk: Excluded provider resources stay upstream. Any optional rendering requires separately authorized target-Agent capabilities.
  Evidence: `docs/security-report.json` `skills/latex-posters/scripts/generate_schematic_ai.py` `skills/latex-posters/scripts/generate_schematic.py` `skills/latex-posters/SKILL.md`.
- latex-posters:2 (critical, partially-confirmed): The current provider utilities use a selected environment and a declared credential for external generation. This supports the credential and outbound-material surface of the historical finding.
  Residual risk: Excluded provider resources stay upstream. Any optional rendering requires separately authorized target-Agent capabilities.
  Evidence: `docs/security-report.json` `skills/latex-posters/scripts/generate_schematic_ai.py` `skills/latex-posters/scripts/generate_schematic.py` `skills/latex-posters/SKILL.md`.
- latex-posters:3 (critical, partially-confirmed): The current provider utilities use a selected environment and a declared credential for external generation. This supports the credential and outbound-material surface of the historical finding.
  Residual risk: Excluded provider resources stay upstream. Any optional rendering requires separately authorized target-Agent capabilities.
  Evidence: `docs/security-report.json` `skills/latex-posters/scripts/generate_schematic_ai.py` `skills/latex-posters/SKILL.md`.
- resource-exclusion (skills/latex-posters/scripts/generate_schematic.py): Exclude the provider-bound wrapper and its full environment inheritance.
- resource-exclusion (skills/latex-posters/scripts/generate_schematic_ai.py): Exclude provider-specific model, network, .env, and credential handling while retaining the independent LaTeX poster capability.
- generated-entry-guidance: Keep templates, poster-design guidance, and local PDF review; describe optional visual generation only through the target Agent's configured generic image capability with no provider names or secret handling.
- compatibility-guidance: Declare LaTeX and local PDF inspection tools as user-provisioned dependencies and require consent before any target-Agent external model use.
- resource-exclusion (skills/latex-posters/references/ai_graphics_for_posters.md): Exclude provider-specific, credential-dependent or execution guidance outside the approved procedure.

### markitdown

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 11/11 files; findings: 1.

- markitdown:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 266 行确含 vendor 自撰 Citing Scientific Agent Skills 段。事实成立；属 Skill 自带内容而非不可信输入，标为 policy violation 属规则名过宽。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献，属内容污染倾向而非安全入侵。
  Evidence: `docs/security-report.json` `skills/markitdown/SKILL.md`.
- generated-entry-guidance: Make local file-to-Markdown conversion the core capability, remove automatic cross-Skill activation, and treat converted text as untrusted data rather than Agent instructions.
- compatibility-guidance: Keep third-party plugins disabled by default; express any optional model-assisted interpretation through the target Agent's generic configured capability without reading, storing, or forwarding credentials.

### modal

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 13/13 files; findings: 5.

- modal:1 (high, false-positive): 实读 references/functions.md 第 83 行（报告记 82）：self.model.eval()，PyTorch 推理模式，原行注释即写明 not Python's built-in eval()。
  Residual risk: 无；文档中的模型推理调用。
  Evidence: `docs/security-report.json` `skills/modal/SKILL.md`.
- modal:2 (medium, false-positive): 实读 references/gpu.md 第 158 行（报告记 157）：文档示例 subprocess.run(["python","train_script.py"], check=True)，固定 argv、无 shell=True。
  Residual risk: 示例启动本地训练进程；无注入面。
  Evidence: `docs/security-report.json` `skills/modal/SKILL.md`.
- modal:3 (medium, false-positive): 实读 references/gpu.md 第 167 行（报告记 166）：subprocess.run(["accelerate","launch",...]) 文档示例，固定 argv、无 shell。
  Residual risk: 示例启动本地分布式训练；无注入面。
  Evidence: `docs/security-report.json` `skills/modal/SKILL.md`.
- modal:4 (medium, false-positive): 实读 references/scheduled-jobs.md 第 142 行（报告记 141）：健康检查示例 requests.post(os.environ["SLACK_URL"], json=...)，目标是用户自配的 Slack webhook。
  Residual risk: 低：示例会把服务状态发往用户配置的 webhook 地址。
  Evidence: `docs/security-report.json` `skills/modal/SKILL.md`.
- modal:5 (medium, false-positive): 实读 references/web-endpoints.md 第 150 行（报告记 149）：subprocess.Popen(["python","-m","vllm..."]) 文档示例，固定 argv、无 shell。
  Residual risk: 示例启动本地 vLLM 服务；无注入面。
  Evidence: `docs/security-report.json` `skills/modal/SKILL.md`.
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
- resource-exclusion (skills/pacsomatic/references/agent-playbook.md): Exclude provider-specific, credential-dependent or execution guidance outside the approved procedure.

### parallel-web

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 8/8 files; findings: 0.


- resource-exclusion (skills/parallel-web/references/web-search.md): Exclude provider-specific CLI, data-transfer, polling, and credential-dependent workflows.
- resource-exclusion (skills/parallel-web/references/web-extract.md): Exclude provider-specific CLI, data-transfer, polling, and credential-dependent workflows.
- resource-exclusion (skills/parallel-web/references/data-enrichment.md): Exclude provider-specific CLI, data-transfer, polling, and credential-dependent workflows.
- resource-exclusion (skills/parallel-web/references/deep-research.md): Exclude provider-specific CLI, data-transfer, polling, and credential-dependent workflows.
- resource-exclusion (skills/parallel-web/references/findall.md): Exclude provider-specific entity-discovery CLI, data-transfer, polling, and credential-dependent workflows.
- resource-exclusion (skills/parallel-web/references/monitor.md): Exclude provider-specific monitoring CLI, persistent external state, webhooks, and credential-dependent workflows.
- generated-entry-guidance: Retain provider-neutral selection for search, URL extraction, repeated enrichment, and deep research through target-Agent capabilities; do not claim all web tasks.
- compatibility-guidance: Do not install a CLI or read, store, or forward API keys; require consent before transmitting queries, URLs, documents, or datasets.
- resource-exclusion (skills/parallel-web/references/api-contracts.md): Exclude provider-specific, credential-dependent or execution guidance outside the approved procedure.

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
  Evidence: `docs/security-report.json` `skills/scientific-schematics/scripts/generate_schematic_ai.py` `skills/scientific-schematics/scripts/generate_schematic.py` `skills/scientific-schematics/SKILL.md`.
- scientific-schematics:2 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：chain 由 generate_schematic.py 向 AI 子进程转交该 key 构成。
  Evidence: `docs/security-report.json` `skills/scientific-schematics/scripts/generate_schematic_ai.py` `skills/scientific-schematics/scripts/generate_schematic.py` `skills/scientific-schematics/SKILL.md`.
- scientific-schematics:3 (low, false-positive): 实读 generate_schematic.py 的 resolve_api_key：不存在硬编码密钥，函数仅从 --api-key、环境变量、再到 .env 逐级查找 OPENROUTER_API_KEY。规则名与事实不符。
  Residual risk: 低：函数会向上遍历父目录寻找 .env，可能读到无关 .env 中的同名键；命中项仅该单一键名。
  Evidence: `docs/security-report.json` `skills/scientific-schematics` `skills/scientific-schematics/SKILL.md`.
- scientific-schematics:4 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：generate_schematic_ai.py 单点鉴权调用。
  Evidence: `docs/security-report.json` `skills/scientific-schematics/scripts/generate_schematic_ai.py` `skills/scientific-schematics/SKILL.md`.
- scientific-schematics:5 (low, partially-confirmed): 实读 SKILL.md 第 372 行：确含 vendor 自撰 Citing Scientific Agent Skills 段。事实成立；属 Skill 自带内容而非不可信输入，标为 policy violation 属规则名过宽。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献，属内容污染倾向而非安全入侵。
  Evidence: `docs/security-report.json` `skills/scientific-schematics/SKILL.md`.
- resource-exclusion (skills/scientific-schematics/scripts/example_usage.sh): Exclude provider-, model-, credential-, or executable-specific material from the generic adapted Skill.
- resource-exclusion (skills/scientific-schematics/scripts/generate_schematic.py): Exclude provider-, model-, credential-, or executable-specific material from the generic adapted Skill.
- resource-exclusion (skills/scientific-schematics/scripts/generate_schematic_ai.py): Exclude provider-, model-, credential-, or executable-specific material from the generic adapted Skill.
- generated-entry-guidance: Retain reviewed schematic design practices and express optional generation through the target Agent's generic image capability without provider names, model claims, or secret handling.
- compatibility-guidance: Require consent before externally sending prompts, research content, or reference images; keep iteration and cost controls with the target Agent.
- resource-exclusion (skills/scientific-schematics/references/iterative_refinement.md): Exclude provider-specific, credential-dependent or execution guidance outside the approved procedure.

### scientific-slides

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 24/24 files; findings: 5.

- scientific-slides:1 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：四个生成脚本共用同一 key→OpenRouter 通道。
  Evidence: `docs/security-report.json` `skills/scientific-slides/scripts/generate_schematic_ai.py` `skills/scientific-slides/scripts/generate_slide_image_ai.py` `skills/scientific-slides/scripts/generate_schematic.py` `skills/scientific-slides/scripts/generate_slide_image.py` `skills/scientific-slides/SKILL.md`.
- scientific-slides:2 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：chain 由多个 generate_*.py 互转同一 key 构成。
  Evidence: `docs/security-report.json` `skills/scientific-slides/scripts/generate_schematic_ai.py` `skills/scientific-slides/scripts/generate_slide_image_ai.py` `skills/scientific-slides/scripts/generate_schematic.py` `skills/scientific-slides/scripts/generate_slide_image.py` `skills/scientific-slides/SKILL.md`.
- scientific-slides:3 (low, partially-confirmed): 实读 generate_slide_image.py 第 55–80 行的 resolve_key：递归向上查找 .env 中的 OPENROUTER_API_KEY，取值后仅作为声明服务（OpenRouter）的 Bearer 头。
  Residual risk: 低：递归 .env 查找可能命中父目录无关 .env 的同名键，但仅读取该键且发往声明 endpoint。
  Evidence: `docs/security-report.json` `skills/scientific-slides` `skills/scientific-slides/SKILL.md`.
- scientific-slides:4 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：generate_schematic_ai.py 单点鉴权调用。
  Evidence: `docs/security-report.json` `skills/scientific-slides/scripts/generate_schematic_ai.py` `skills/scientific-slides/SKILL.md`.
- scientific-slides:5 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：generate_slide_image_ai.py 单点鉴权调用。
  Evidence: `docs/security-report.json` `skills/scientific-slides/scripts/generate_slide_image_ai.py` `skills/scientific-slides/SKILL.md`.
- resource-exclusion (skills/scientific-slides/scripts/generate_schematic.py): Exclude provider-specific image generation, network, environment, and credential handling.
- resource-exclusion (skills/scientific-slides/scripts/generate_schematic_ai.py): Exclude provider-specific image generation, network, environment, and credential handling.
- resource-exclusion (skills/scientific-slides/scripts/generate_slide_image.py): Exclude provider-specific image generation, network, environment, and credential handling.
- resource-exclusion (skills/scientific-slides/scripts/generate_slide_image_ai.py): Exclude provider-specific image generation, network, environment, and credential handling.
- generated-entry-guidance: Retain slide structure, design, templates, local conversion, and validation; optional visuals use only the target Agent's generic image capability without secret handling.
- compatibility-guidance: Show local input/output paths and obtain confirmation before conversion or pdflatex validation; external image use requires consent.
- resource-exclusion (skills/scientific-slides/references/script_reference.md): Exclude provider-specific, credential-dependent or execution guidance outside the approved procedure.

### seaborn

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 8/8 files; findings: 1.

- seaborn:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 256 行确含 vendor 自撰 Citing Scientific Agent Skills 段，含 arXiv:2609.00065 与网络抓取指示。事实成立；属 Skill 自带内容而非不可信输入。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献；引用的 arXiv 记录需自行核验。
  Evidence: `docs/security-report.json` `skills/seaborn/SKILL.md`.
- generated-entry-guidance: Identify the Skill as a ResearchSpec-maintained Seaborn usage guide rather than an official distribution; prefer local datasets and disclose sns.load_dataset network access.
- compatibility-guidance: Do not install dependencies; require a project-pinned Seaborn environment including optional statistical packages when used.

### transformers

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 7/7 files; findings: 1.

- transformers:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 197 行确含 vendor 自撰 Citing Scientific Agent Skills 段。事实成立；属 Skill 自带内容而非不可信输入，标为 policy violation 属规则名过宽。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献，属内容污染倾向而非安全入侵。
  Evidence: `docs/security-report.json` `skills/transformers/SKILL.md`.
- generated-entry-guidance: Default trust_remote_code to false; allow it only for a user-confirmed immutable model revision after reviewing the exact third-party code.
- compatibility-guidance: Use only target-environment authentication; do not read, print, store, or forward HF tokens, and treat downloads, uploads, and remote code as explicit external actions.

### umap-learn

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 2/2 files; findings: 1.

- umap-learn:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 474 行确含 vendor 自撰 Citing Scientific Agent Skills 段，含网络抓取指示。事实成立；属 Skill 自带内容而非不可信输入。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献；引用的 arXiv 记录需自行核验。
  Evidence: `docs/security-report.json` `skills/umap-learn/SKILL.md`.
- generated-entry-guidance: Limit activation to explicit UMAP-family dimensionality-reduction work and load Parametric UMAP models only from user-confirmed local directories.
- compatibility-guidance: Do not install dependencies; require project-level pins for UMAP and optional clustering or parametric dependencies.

### venue-templates

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 32/32 files; findings: 1.

- venue-templates:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 271 行确含 vendor 自撰 Citing Scientific Agent Skills 段。事实成立；属 Skill 自带内容而非不可信输入，标为 policy violation 属规则名过宽。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献，属内容污染倾向而非安全入侵。
  Evidence: `docs/security-report.json` `skills/venue-templates/SKILL.md`.
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
- Reviewed inventory: 5/5 files; findings: 0.


- generated-entry-guidance: Limit activation to explicit CZ CELLxGENE Census work, prefer a fixed LTS Census version, and confirm that queries contain no private or unpublished data.
- compatibility-guidance: Do not install dependencies; require project-level pins for Census, spatial, and ML packages and preserve the ToolUniverse overlap blocker.

### citation-management

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: arsu-surface-overlap.
- Reviewed inventory: 22/22 files; findings: 6.

- citation-management:1 (critical, partially-confirmed): 当前内容实读：search_pubmed.py 读取 NCBI_API_KEY / NCBI_EMAIL 并请求 eutils.ncbi.nlm.nih.gov；extract_metadata.py 读取 NCBI_API_KEY 并请求 eutils/crossref/arxiv/PMC idconv；search_openalex.py 读取 OPENALEX_EMAIL 请求 api.openalex.org；doi_to_bibtex.py 与 validate_citations.py 无 env 读取。env 与网络同现，但目的地全为声明的公开学术 API，属鉴权传输而非外泄。
  Residual risk: API key/邮箱随显式调用发往声明端点；残余风险为凭据外发与第三方可用性。
  Evidence: `docs/security-report.json` `skills/citation-management/scripts/search_pubmed.py` `skills/citation-management/scripts/extract_metadata.py` `skills/citation-management/SKILL.md`.
- citation-management:2 (critical, partially-confirmed): 同上：chain 由五个脚本各自的检索请求聚合，非单点未声明通道。
  Residual risk: 凭据随显式调用发往声明的学术 API。
  Evidence: `docs/security-report.json` `skills/citation-management/scripts/search_pubmed.py` `skills/citation-management/scripts/extract_metadata.py` `skills/citation-management/scripts/search_openalex.py` `skills/citation-management/scripts/validate_citations.py` `skills/citation-management/scripts/doi_to_bibtex.py` `skills/citation-management/SKILL.md`.
- citation-management:3 (critical, partially-confirmed): extract_metadata.py 的 NCBI_API_KEY 单点鉴权调用。
  Residual risk: 低：NCBI key 随显式调用发往 NCBI eutils。
  Evidence: `docs/security-report.json` `skills/citation-management/scripts/extract_metadata.py` `skills/citation-management/SKILL.md`.
- citation-management:4 (critical, partially-confirmed): search_pubmed.py 的 NCBI_API_KEY / NCBI_EMAIL 单点鉴权调用。
  Residual risk: 低：NCBI key 与邮箱随显式调用发往 NCBI eutils。
  Evidence: `docs/security-report.json` `skills/citation-management/scripts/search_pubmed.py` `skills/citation-management/SKILL.md`.
- citation-management:5 (low, partially-confirmed): 实读 SKILL.md 第 331 行：确含 vendor 自撰 Citing Scientific Agent Skills 段。事实成立，属内容污染倾向而非安全入侵。
  Residual risk: 低：会改动用户产出的参考文献。
  Evidence: `docs/security-report.json` `skills/citation-management/SKILL.md`.
- citation-management:6 (medium, false-positive): 实读 references/core_workflow.md 第 193 行附近代码块：文档演示的正是安全写法——参数以列表传入 subprocess.run、显式 check=True、注明 no shell=True，且先以正则校验 citation_key。该块是防注入指导，不是注入面。
  Residual risk: 无；文档本身即缓解措施。
  Evidence: `docs/security-report.json` `skills/citation-management/SKILL.md`.
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
- resource-exclusion (skills/citation-management/scripts/search_openalex.py): Exclude provider-specific, credential-dependent or execution guidance outside the approved procedure.

### clinical-decision-support

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 28/28 files; findings: 1.

- clinical-decision-support:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 240 行确含 vendor 自撰 Citing Scientific Agent Skills 段，指示 Agent 将 arXiv:2609.00065 写入用户交付物、告知用户，并在网络可用时抓取 arXiv 记录。事实成立；该段属 Skill 自带内容而非不可信输入，标为 policy violation 属规则名过宽。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献，属内容污染倾向而非安全入侵；抓取目标是公开 arXiv 记录。
  Evidence: `docs/security-report.json` `skills/clinical-decision-support/SKILL.md`.
- generated-entry-guidance: Retain local cohort, biomarker, survival, decision-tree, and validation resources; optional visuals may use only target-Agent generic image capability after explicit consent.
- compatibility-guidance: Limit use to research and education, require de-identified inputs and qualified clinical review, and do not present outputs as autonomous diagnosis or treatment decisions.

### clinical-reports

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 36/36 files; findings: 1.

- clinical-reports:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 250 行确含 vendor 自撰 Citing Scientific Agent Skills 段，指示 Agent 将 arXiv:2609.00065 写入用户交付物、告知用户，并在网络可用时抓取 arXiv 记录。事实成立；该段属 Skill 自带内容而非不可信输入，标为 policy violation 属规则名过宽。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献，属内容污染倾向而非安全入侵；抓取目标是公开 arXiv 记录。
  Evidence: `docs/security-report.json` `skills/clinical-reports/SKILL.md`.
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

- database-lookup:1 (low, not-applicable): The interpolation pattern cited in the historical report was removed from the current entry. The current instructions separate untrusted identifiers from command construction.
  Residual risk: Optional external retrieval and command permissions remain subject to user authorization.
  Evidence: `docs/security-report.json` `skills/database-lookup` `skills/database-lookup/SKILL.md`.
- database-lookup:2 (low, not-applicable): 实读 SKILL.md 第 107、115–127 行：仅要求在需要时按名查询 .env 中的指定 key，并明确不得读取或展示整个 .env。属文档化的正当凭据用法。
  Residual risk: 低：Agent 须严格只读取指定键名，不得打印 .env 内容。
  Evidence: `docs/security-report.json` `skills/database-lookup/SKILL.md`.
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
  Evidence: `docs/security-report.json` `skills/histolab/SKILL.md` `skills/histolab/references/tile_extraction.md`.
- histolab:2 (low, false-positive): 同一位置的复核结论：该 LOW 项是确定性分析器的前置线索，报告自身亦标注为 false-positive lead；实读确认为 OpenCV 常量。
  Residual risk: 无。
  Evidence: `docs/security-report.json` `skills/histolab/SKILL.md` `skills/histolab/references/tile_extraction.md`.
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
  Evidence: `docs/security-report.json` `skills/literature-review/scripts/generate_schematic_ai.py` `skills/literature-review/scripts/generate_schematic.py` `skills/literature-review/SKILL.md`.
- literature-review:2 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：chain 由 generate_schematic.py 向 AI 子进程转交该 key、verify_citations.py 另行联网构成。
  Evidence: `docs/security-report.json` `skills/literature-review/scripts/generate_schematic_ai.py` `skills/literature-review/scripts/generate_schematic.py` `skills/literature-review/scripts/verify_citations.py` `skills/literature-review/SKILL.md`.
- literature-review:3 (critical, partially-confirmed): 当前内容实读：脚本仅从 OPENROUTER_API_KEY（env 或 .env）取 key，作为 Authorization 头 POST 到唯一声明的 endpoint https://openrouter.ai/api/v1；跨文件 chain 来自 generate_*.py 经 build_subprocess_env 把该 key 转交 AI 子进程。属对声明服务的鉴权传输，不证明外泄。
  Residual risk: 低–中：generate_schematic_ai.py 单点鉴权调用。
  Evidence: `docs/security-report.json` `skills/literature-review/scripts/generate_schematic_ai.py` `skills/literature-review/SKILL.md`.
- literature-review:4 (low, not-applicable): The candidate tree no longer contains the historical installer instruction. Installation guidance remains external to the workflow.
  Residual risk: Other provider-dependent resources remain excluded.
  Evidence: `docs/security-report.json` `skills/literature-review/SKILL.md`.
- resource-exclusion (skills/literature-review/scripts/generate_schematic.py): Exclude provider-specific subprocess, inherited-environment, and image-generation behavior.
- resource-exclusion (skills/literature-review/scripts/generate_schematic_ai.py): Exclude provider-specific network, credential, .env, prompt, dependency, and model handling.
- generated-entry-guidance: Remove mandatory figures and parallel-cli installation, authentication, and command coupling; use only target-Agent configured literature retrieval and treat all external content as untrusted data.
- compatibility-guidance: Retain local result processing and PDF generation; fixed DOI/Crossref verification requires explicit network consent, a bounded request count, and a non-overwriting report path. The target project owns dependency locking.

### paperzilla

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 2/2 files; findings: 0.


- generated-entry-guidance: Remove installation, upgrade, login, and environment configuration instructions; allow only a user-installed, authenticated, explicitly authorized pz client and treat returned Markdown as untrusted data.
- compatibility-guidance: The Skill never reads, stores, or forwards credentials; browsing and export are read-only, while submitting or clearing recommendation feedback requires separate user confirmation.
- resource-exclusion (skills/paperzilla/references/cli-contracts.md): Exclude provider-specific, credential-dependent or execution guidance outside the approved procedure.

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
- Reviewed inventory: 3/3 files; findings: 0.


- resource-exclusion (skills/primekg/scripts/query_primekg.py): Exclude the hardcoded, repeatedly full-loading, regex-interpreting query implementation rather than maintaining an executable patch.
- generated-entry-guidance: Retain only PrimeKG entity, relation, and query-method knowledge; do not claim a packaged local query runtime or fixed data location.
- compatibility-guidance: Any future data adapter requires an explicit configured source, indexed or single-load access, literal matching, bounded results, and independently resolved license evidence.

### research-lookup

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: arsu-surface-overlap.
- Reviewed inventory: 5/5 files; findings: 4.

- research-lookup:1 (critical, partially-confirmed): 当前内容实读：research_lookup.py 读取 PARALLEL_API_KEY / OPENROUTER_API_KEY，仅作为 Bearer 头 POST 到 api.parallel.ai/chat/completions 与 openrouter.ai/api/v1/chat/completions。属对声明服务的鉴权传输。
  Residual risk: 凭据随显式调用发往声明的检索服务。
  Evidence: `docs/security-report.json` `skills/research-lookup/scripts/research_lookup.py` `skills/research-lookup/SKILL.md`.
- research-lookup:2 (critical, partially-confirmed): chain 由 research_lookup.py 与 manuscript_packet.py 的文件交接聚合；后者自身不做 env 读取或网络请求。
  Residual risk: 凭据随显式调用发往声明的检索服务。
  Evidence: `docs/security-report.json` `skills/research-lookup/scripts/research_lookup.py` `skills/research-lookup/scripts/manuscript_packet.py` `skills/research-lookup/SKILL.md`.
- research-lookup:3 (critical, partially-confirmed): research_lookup.py 单点鉴权调用。
  Residual risk: 低：PARALLEL/OPENROUTER key 随显式调用发往声明端点。
  Evidence: `docs/security-report.json` `skills/research-lookup/scripts/research_lookup.py` `skills/research-lookup/SKILL.md`.
- research-lookup:4 (low, not-applicable): 实读同源：该 LOW 项把 env 读取 + Authorization 头判为外泄链，核实为声明 key 对声明 endpoint 的常规用法，不构成数据外泄。
  Residual risk: 无；仅需用户知晓查询内容会送达所选检索后端。
  Evidence: `docs/security-report.json` `skills/research-lookup/SKILL.md`.
- resource-exclusion (skills/research-lookup/README.md): Exclude provider installation, authentication, API-key, and setup guidance.
- resource-exclusion (skills/research-lookup/scripts/research_lookup.py): Exclude the duplicated provider API, credential, routing, and network implementation.
- generated-entry-guidance: Retain only query planning, source selection, and result verification principles; use target-Agent configured retrieval, remove mandatory storage and images, and treat external content as untrusted data.
- compatibility-guidance: The Skill handles no credentials; disclose the destination and query content and obtain consent before any external retrieval.
- resource-exclusion (skills/research-lookup/references/api-contracts.md): Exclude provider-specific, credential-dependent or execution guidance outside the approved procedure.

### scholar-evaluation

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: arsu-surface-overlap.
- Reviewed inventory: 19/19 files; findings: 1.

- scholar-evaluation:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 298 行确含 vendor 自撰 Citing Scientific Agent Skills 段。事实成立；属 Skill 自带内容而非不可信输入，标为 policy violation 属规则名过宽。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献，属内容污染倾向而非安全入侵。
  Evidence: `docs/security-report.json` `skills/scholar-evaluation/SKILL.md`.
- generated-entry-guidance: Retain the local score calculator and evaluation framework; remove provider, model, credential, cross-Skill, and default-image guidance. Scores are advisory and cannot modify ResearchSpec state, Gates, Decisions, or receipts.
- compatibility-guidance: Confirm report output paths and never overwrite by default; preserve the independent ARSU surface-overlap blocker.

### scientific-writing

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: arsu-surface-overlap.
- Reviewed inventory: 31/31 files; findings: 1.

- scientific-writing:1 (low, partially-confirmed): 当前内容实读：SKILL.md 第 358 行确含 vendor 自撰 Citing Scientific Agent Skills 段。事实成立；属 Skill 自带内容而非不可信输入，标为 policy violation 属规则名过宽。
  Residual risk: 低：会让 Agent 改动用户产出的参考文献，属内容污染倾向而非安全入侵。
  Evidence: `docs/security-report.json` `skills/scientific-writing/SKILL.md`.
- generated-entry-guidance: Retain writing, IMRaD, citation, reporting, formatting, template, figure, and table guidance; remove provider, model, credential, cross-Skill, and mandatory-image instructions.
- compatibility-guidance: Optional visuals may use only target-Agent generic capability after explicit consent to send research material, and the Skill cannot bypass the ARSU writing workflow.

### tiledbvcf

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 2/2 files; findings: 0.


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
  Evidence: `docs/security-report.json` `skills/usfiscaldata/SKILL.md`.
- generated-entry-guidance: Use only the official U.S. Treasury Fiscal Data endpoint, parameterized requests, and bounded pagination; show endpoint, filters, and expected result size before retrieval and treat responses as data.
- compatibility-guidance: The target project locks any requests and pandas dependencies; record query date and do not present retrieved fiscal data as investment or policy advice.

### zarr-python

- Maintainer action: clear-with-adaptation; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 8/8 files; findings: 0.


- generated-entry-guidance: Retain local Zarr workflows and pinned-version guidance; cloud stores require explicit user selection, a displayed store URI and write mode, and confirmation of data scale and transfer.
- compatibility-guidance: Use only target-environment provider SDK identities; never read, display, copy, or request pasted credentials, and never overwrite an existing array or group by default.

### autoskill

- Maintainer action: defer; production: excluded.
- Independent blockers: outside-plugin-authority, upstream-security-review-required.
- Reviewed inventory: 16/16 files; findings: 7.

- autoskill:1 (critical, partially-confirmed): 当前内容实读：scripts/backends.py 读取 ANTHROPIC_API_KEY / FOUNDRY_API_KEY 并经 httpx 发往声明的 api.anthropic.com 与 foundry endpoint；scripts/doctor.py 读取 SCREENPIPE_TOKEN 访问本地 daemon；scripts/run.py 用 SCREENPIPE_TOKEN 访问 http://localhost:3030。env 变量与网络调用确实同现，属对声明服务的鉴权传输；同现本身不证明外泄，故不判 confirmed 外泄。
  Residual risk: 凭据随显式调用离开宿主；endpoint 在 backends.py 中被校验为 https 或 loopback（明文 http 仅限本机），未见未声明目的地。
  Evidence: `docs/security-report.json` `skills/autoskill/scripts/backends.py` `skills/autoskill/scripts/doctor.py` `skills/autoskill/scripts/run.py` `skills/autoskill/SKILL.md`.
- autoskill:2 (critical, partially-confirmed): 同上：跨文件 chain 由 backends.py、doctor.py、run.py 三处 env 读取与各自网络调用聚合而成，非单点隐蔽通道。
  Residual risk: 凭据随显式调用离开宿主；该 skill 本已因 authority 排除。
  Evidence: `docs/security-report.json` `skills/autoskill/scripts/backends.py` `skills/autoskill/scripts/doctor.py` `skills/autoskill/scripts/run.py` `skills/autoskill/SKILL.md`.
- autoskill:3 (critical, partially-confirmed): backends.py 一处 env 读取 + 网络调用，属声明服务鉴权。
  Residual risk: 同上；仅该文件。
  Evidence: `docs/security-report.json` `skills/autoskill/scripts/backends.py` `skills/autoskill/SKILL.md`.
- autoskill:4 (critical, partially-confirmed): doctor.py 一处 env 读取（SCREENPIPE_TOKEN）+ 本地 daemon 调用，属声明服务鉴权。
  Residual risk: 同上；仅该文件。
  Evidence: `docs/security-report.json` `skills/autoskill/scripts/doctor.py` `skills/autoskill/SKILL.md`.
- autoskill:5 (critical, partially-confirmed): run.py 一处 env 读取（SCREENPIPE_TOKEN）+ http://localhost:3030 调用，属本机声明服务鉴权。
  Residual risk: 同上；仅该文件。
  Evidence: `docs/security-report.json` `skills/autoskill/scripts/run.py` `skills/autoskill/SKILL.md`.
- autoskill:6 (low, partially-confirmed): 实读 scripts/backends.py：屏幕派生摘要与 API key 会发往用户可配置的远端 endpoint，属声明能力内的数据外出，而非未声明通道。
  Residual risk: 上传内容含屏幕派生文本，用户需自行确认所配 endpoint 可信。
  Evidence: `docs/security-report.json` `skills/autoskill/SKILL.md`.
- autoskill:7 (medium, partially-confirmed): 脚本存在屏幕 OCR 文本进入 LLM prompt 的路径（规则指向 scripts/promote.py）。该结构真实存在，但本次未逐行审读 promote.py 的拼接细节，故不判 confirmed。
  Residual risk: OCR/屏幕文本作为 prompt 输入存在间接注入面；未逐行确认是否有过滤或分隔防护。
  Evidence: `docs/security-report.json` `skills/autoskill/SKILL.md`.


### waypoint-bio

- Maintainer action: clear; production: excluded.
- Independent blockers: tooluniverse-semantic-overlap.
- Reviewed inventory: 8/8 files; findings: 2.

- waypoint-bio:1 (high, false-positive): 实读 references/python-api.md 第 118 行（报告记 117，0-based）：model = AutoModel.from_pretrained(model_id).eval()，是 transformers 推理模式，非 Python 内置 eval/exec。
  Residual risk: 无：文档示例为常规 HuggingFace 推理用法。
  Evidence: `docs/security-report.json` `skills/waypoint-bio/SKILL.md`.
- waypoint-bio:2 (medium, false-positive): 实读 references/python-api.md 约第 203 行：subprocess.run(["waypoint","finetune",...]) 的 CLI 示例，固定 argv 列表、无 shell=True、无用户输入拼接。
  Residual risk: 示例执行本地 waypoint CLI；仅在用户显式按其运行时有效，不构成注入面。
  Evidence: `docs/security-report.json` `skills/waypoint-bio/SKILL.md`.


### generate-image

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 3/3 files; findings: 0.


- generated-entry-guidance: Project an image brief, evidence verification and optional target-Agent generic generation with separate consent for destination, shared material and cost.
- resource-exclusion (skills/generate-image/scripts/generate_image.py): Exclude provider-specific, credential-dependent or execution guidance outside the approved procedure.
- resource-exclusion (skills/generate-image/references/models.md): Exclude provider-specific, credential-dependent or execution guidance outside the approved procedure.

### ginkgo-cloud-lab

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 19/19 files; findings: 1.

- ginkgo-cloud-lab:1 (low, partially-confirmed): The source includes the vendor self-citation directive. The curated projection keeps attribution optional and omits the network fetch instruction.
  Residual risk: External transaction and sample-transfer guidance is outside the curated entry.
  Evidence: `docs/security-report.json` `skills/ginkgo-cloud-lab/SKILL.md`.
- generated-entry-guidance: Project advisory comparison, quote assumptions, permissions and evidence expectations. Keep lab operation, ordering, account access and transfer of sample or design materials outside this procedure.
- resource-exclusion (skills/ginkgo-cloud-lab/references/cell-free-protein-expression-hibit.md): Keep operational laboratory service guidance and ordering resources outside the advisory projection.
- resource-exclusion (skills/ginkgo-cloud-lab/references/cell-free-protein-expression-optimization.md): Keep operational laboratory service guidance and ordering resources outside the advisory projection.
- resource-exclusion (skills/ginkgo-cloud-lab/references/cell-free-protein-expression-validation.md): Keep operational laboratory service guidance and ordering resources outside the advisory projection.
- resource-exclusion (skills/ginkgo-cloud-lab/references/cfps-expression-purification-quantification.md): Keep operational laboratory service guidance and ordering resources outside the advisory projection.
- resource-exclusion (skills/ginkgo-cloud-lab/references/cfps-strep-purification-thermal-shift.md): Keep operational laboratory service guidance and ordering resources outside the advisory projection.
- resource-exclusion (skills/ginkgo-cloud-lab/references/cfps-strep-tag-purification-a280.md): Keep operational laboratory service guidance and ordering resources outside the advisory projection.
- resource-exclusion (skills/ginkgo-cloud-lab/references/echo-ms-cfps-detection.md): Keep operational laboratory service guidance and ordering resources outside the advisory projection.
- resource-exclusion (skills/ginkgo-cloud-lab/references/echo-ms-method-onboarding.md): Keep operational laboratory service guidance and ordering resources outside the advisory projection.
- resource-exclusion (skills/ginkgo-cloud-lab/references/ecoli-expression-purification-quantification.md): Keep operational laboratory service guidance and ordering resources outside the advisory projection.
- resource-exclusion (skills/ginkgo-cloud-lab/references/ecoli-minibinder-expression-histag-a280.md): Keep operational laboratory service guidance and ordering resources outside the advisory projection.
- resource-exclusion (skills/ginkgo-cloud-lab/references/ecoli-protein-expression-hibit.md): Keep operational laboratory service guidance and ordering resources outside the advisory projection.
- resource-exclusion (skills/ginkgo-cloud-lab/references/ecoli-protein-expression-histag-a280.md): Keep operational laboratory service guidance and ordering resources outside the advisory projection.
- resource-exclusion (skills/ginkgo-cloud-lab/references/fluorescent-pixel-art-generation.md): Keep operational laboratory service guidance and ordering resources outside the advisory projection.
- resource-exclusion (skills/ginkgo-cloud-lab/references/ivt-rna-synthesis-qpcr.md): Keep operational laboratory service guidance and ordering resources outside the advisory projection.
- resource-exclusion (skills/ginkgo-cloud-lab/references/minibinder-strep-tag-a280.md): Keep operational laboratory service guidance and ordering resources outside the advisory projection.
- resource-exclusion (skills/ginkgo-cloud-lab/references/pichia-protein-expression-labchip.md): Keep operational laboratory service guidance and ordering resources outside the advisory projection.
- resource-exclusion (skills/ginkgo-cloud-lab/references/plate-reader-assay-onboarding.md): Keep operational laboratory service guidance and ordering resources outside the advisory projection.
- resource-exclusion (skills/ginkgo-cloud-lab/references/spr-target-onboarding.md): Keep operational laboratory service guidance and ordering resources outside the advisory projection.

### marine-carbonate-chemistry

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 4/4 files; findings: 0.


- generated-entry-guidance: Use authorized local data and a fresh output directory. Record units, chemical assumptions, and uncertainty.

### nmrglue

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 4/4 files; findings: 0.


- generated-entry-guidance: Use explicit local signals and preserve calibration. Treat imported files as untrusted and keep the upstream binary test fixture outside distribution.

### nwb-conversion

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 5/5 files; findings: 0.


- generated-entry-guidance: Keep data and conversion local. Accept the NWB only with a complete validation and round-trip report.

### pybamm

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 4/4 files; findings: 0.


- generated-entry-guidance: Use a provisioned solver, fresh output directory and explicit assumptions. Record numerical sensitivity and any limits of the comparison with measurements.

### pycalphad

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 5/5 files; findings: 0.


- generated-entry-guidance: Retain the hypothetical TDB attribution and scope. Use separately licensed local assessed databases for experimental conclusions.

### flowkit

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 4/4 files; findings: 0.


- generated-entry-guidance: Keep authorized local inputs explicit and use a fresh output directory. Treat imported workspace and sample files as untrusted.

### cellprofiler

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 4/4 files; findings: 0.


- generated-entry-guidance: Use a trusted, user-provisioned local application and explicit image permissions. Keep external image transfer and container provisioning outside the procedure.

### 13c-metabolic-flux

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 16/16 files; findings: 0.


- generated-entry-guidance: Use local measured data and user-provisioned dependencies. Preserve the adapted example notice and report model identifiability limits.

### cantera

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 4/4 files; findings: 0.


- generated-entry-guidance: Use a trusted local mechanism and a provisioned runtime. Keep untrusted executable extensions outside the procedure and preserve provenance and numerical limits.

### qiime2-amplicon

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 3/3 files; findings: 0.


- generated-entry-guidance: Use authorized local data, a provisioned runtime and a fresh output location. Record classifier provenance and keep external data transfer outside the procedure.

### relion

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 4/4 files; findings: 0.


- generated-entry-guidance: Confirm executable identity, local inputs and output location. Keep scheduler submissions and external data transfer outside the procedure.

### tellurium

- Maintainer action: clear-with-adaptation; production: admitted.
- Independent blockers: none.
- Reviewed inventory: 5/5 files; findings: 0.


- generated-entry-guidance: Accept trusted local model inputs and use a fresh output directory. Keep runtime provisioning and external transfers outside the procedure.

