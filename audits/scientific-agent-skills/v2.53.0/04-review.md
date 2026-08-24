# Scientific Agent Skills Extension Anchor Review — v2.53.0

## Registry And Domain Review

- capability entries: 49
- profile entries: 49
- Scientific Agent Skills 领域分配由 `src/plugins/domain-catalog.json` 自动镜像
- 每个领域只包含其 reviewed raw Skills 对应 extension
- extension capability IDs 与 raw Skill IDs 不冲突；与 bundled capabilities 不冲突。

## Package Review

| capability_id | package tree SHA-256 | profile SHA-256 | tool files | tools byte-identical | required fields bound |
|---|---|---|---|---|---|
| `plugin-scientific-agent-skills-aeon` | `dd7e2021d4596670d11c2069c5b4253696637e31d52aedd34d18eb34659fe505` | `ad7fc7838bbad822dfa343750222de1efd06920ace7d296f298aa1e56cd552e4` | 11 | yes | yes |
| `plugin-scientific-agent-skills-astropy` | `8d155fd83cb7abf6e349ef1d0d1aa6f281b38041d54566aaa39070395e21fd52` | `de8cdadeda6f83558e71ed75352921c8b34d62f481ec4550589385b2782dc66e` | 7 | yes | yes |
| `plugin-scientific-agent-skills-benchling-integration` | `bb8935711049e8f27a89cf2ee4bbb81f53a9523c3e3098dd0b9f64a7e6c95772` | `f6fca0c475542e946d654e56f3b49f18f81eab57a4fd747d04f36d1ebf4c3724` | 4 | yes | yes |
| `plugin-scientific-agent-skills-cirq` | `3d720e71227a15f7e5241aace51f035b71573b279c3c5b3e09486a0eb5164027` | `75619696bec6a10fc806d78f5c602bfec3b27541b06ef58a49b67439adee7ac6` | 6 | yes | yes |
| `plugin-scientific-agent-skills-fluidsim` | `de3f7f33c7d7b4caee171c25e6e72bdb41400db984299dc97a1ec38ce8d9fd8f` | `17c28bbf59f832e09d781da0a327176499cd93afb9cad4cb71c1cd3ec81a08f8` | 6 | yes | yes |
| `plugin-scientific-agent-skills-generate-image` | `94b8e04380e38ea2dbd078f34f671264e83f745ae322ddd19b6ec80b4a817a88` | `34818885084cfb22cc86319bdbb07454ad7eee78ac0320a1f4fecef1bc912c60` | 1 | yes | yes |
| `plugin-scientific-agent-skills-geomaster` | `f462259fa110b2e61b2a40cb9d0456139f7751cc8b3c20e4709fdfb575d7b58c` | `dfaf987eafd72137c28c62fefca7f365b1be73a3181dec427de384b8c8f769a7` | 15 | yes | yes |
| `plugin-scientific-agent-skills-geopandas` | `cb36fea9abb17b0678dc014eb4298662c3f5a72ff4c291f025ef8fca8b5e2a74` | `1582a7f68d0239f480858fe1289f111d83fa97804bf6474973a6dc294d2af2a4` | 6 | yes | yes |
| `plugin-scientific-agent-skills-ginkgo-cloud-lab` | `4004322f15935d4c04a4823aee775cb8d8faa49eb7a11ae5403292d9032f7cd1` | `c998e9e781860d915bc3e0a052e67bd396549855366eafac6d5dfcf019331c90` | 17 | yes | yes |
| `plugin-scientific-agent-skills-infographics` | `2e9e6c4cb4c528bc6fea9e1518698cbe26811f5a34ae92efeb3496c951fb8ecc` | `bc9f0ddfe578cc8497b5158901165cb722ae534a8a3d4c3bb692989aa930d33b` | 3 | yes | yes |
| `plugin-scientific-agent-skills-labarchive-integration` | `b45bdab897e80e63e1e0fab03d5c521187a27ea329d43c4c287e78ddc4099303` | `7eb0da74b562733967766c3e9f5143248559899d8782ab398167a150a43ee8c5` | 6 | yes | yes |
| `plugin-scientific-agent-skills-latex-posters` | `c3c9eaa4d92ec77d954862655457df7c235700613e6afa16f9b31530bbd3b9cf` | `304dd3704ac953337d5ce1a20acc86beb79a6ac1b0b6900aacfe8fa04e8fdc8b` | 10 | yes | yes |
| `plugin-scientific-agent-skills-liteparse` | `f26cfa6b84bb449d3a18aca8a8326c0891e0dfc8aa60e7eeb0cab33a35cb6454` | `2239de72c8cad062be4703d09d6f9ef0c1af3790ced53fcc0c9ebca125af9f32` | 6 | yes | yes |
| `plugin-scientific-agent-skills-markdown-mermaid-writing` | `c1a98abb77a85df266f102265564c3544c5556917e96c8fd423387ba9c9317c2` | `5572012b92e45d994596c779312299ef2945f4d455acd96c48556a07839d963b` | 36 | yes | yes |
| `plugin-scientific-agent-skills-markitdown` | `f4df567537010c582f63f1f1b153f9f46df22a34afc9f88ef9f8dc488a32ede5` | `a22414be86a094d0865e586bb227e2944e26168c99bdaaf8d1e876cd6834913a` | 5 | yes | yes |
| `plugin-scientific-agent-skills-matlab` | `af6db7f653f9ed6a41cbfb379dda8b57bf413bd7b3a371a3a7f6afb9469b537e` | `6a04bc6aae10be04145feb58a7a1fd4c384bd38afc367f4cca5fefc8fa9f6e1d` | 8 | yes | yes |
| `plugin-scientific-agent-skills-matplotlib` | `4b2fdcf728de6b3cdb236b781602f344557c04d3edbd20b6523cd12c45c62b50` | `1c69886f19bbfae50119612abf6e9b1cebaca32be0879420b5d6e502f142b1b9` | 6 | yes | yes |
| `plugin-scientific-agent-skills-modal` | `5a5ef81e1000ba665518dfd507ac437b4f44590e7fd12483d2a22eea1adca630` | `ea54f92df7ce3c3f9ab281a7dcb258443e7b835fed03b33aa7580e23ce57999a` | 11 | yes | yes |
| `plugin-scientific-agent-skills-networkx` | `e98a50856493222d319dc2e966854b9466e603fbda0af1d4cf4fd48b482066c8` | `7683f47da83ebc03915b70979176d9f1cf12a14dae44067e08b66128528dabca` | 5 | yes | yes |
| `plugin-scientific-agent-skills-open-notebook` | `30d6d0b29f919013d2285b157b48e7ae39053267a59aec72c6906d5d4b1b3478` | `3867eb720a6f8ea480a339fa201ca8fafd63bfe62bb418714673d4f151015ca8` | 7 | yes | yes |
| `plugin-scientific-agent-skills-opentrons-integration` | `373cb71cdd9d8e1df4c1b6b5dd83bbf587e55dc542e72d92fc5ede4bc9e20a83` | `ddcbb4f2ba652b7b38d7520122864082b98de52e37c1092c239fb8b2e3bc9761` | 4 | yes | yes |
| `plugin-scientific-agent-skills-optimize-for-gpu` | `bcc55d98fb5e830178ab542a1c664d8e3e1b700d2a025ca2083bc8938e82ae3e` | `59c423123b60b0742986e8f3e70aea876c2598c660864367e9e074828ad1d40d` | 12 | yes | yes |
| `plugin-scientific-agent-skills-pacsomatic` | `75d9edae2c7fe262ca5368043b41b62788132b56b57fe32316d6fe0c83d73e53` | `9b0652244a02885ddc1b1e13a18527502db8699ab7985a845a99bcf49aa93494` | 4 | yes | yes |
| `plugin-scientific-agent-skills-parallel-web` | `678d007806ecd3fd9c1377f1a6014c1844b20fa138950a8290401cc877e87096` | `588cf7d466fbddcaa869951ab39bddd1872661e591ff629a86cfc95e0b63785e` | 0 | yes | yes |
| `plugin-scientific-agent-skills-pennylane` | `790ab950a55c7fd89908d568a6d992e8c73b44612f26f43da9bb74a43556758c` | `a2386da94735ba7a2627e2ad7bcd69ff580d81fadaa9cc4507d37d7fd3a0c643` | 7 | yes | yes |
| `plugin-scientific-agent-skills-pptx-posters` | `7798d0305f54d5b3e6c602bb4d0e235fa170a636da6189bf51e57177a2a6a76e` | `c3e311f6421817fb4ff8672b9b376c0b0eea6b8c30ed0cc21f8d80a1be66a3f7` | 5 | yes | yes |
| `plugin-scientific-agent-skills-protocolsio-integration` | `2f016d8b9ab5c14bac29d80016526806a24689b56539938fcbaf0f2c3257afe8` | `6562b92e58a617e6b4301d07f1e41fd7cd6d19fbf078880122393bb3dd61ceb5` | 6 | yes | yes |
| `plugin-scientific-agent-skills-pufferlib` | `85d4e73956986eff3d5fda7148717a0bff103f167c99daa481798aea72bf7229` | `c8c98524eb94b34d1e21b068a188e372efb4afc1c766b2f24e77f2b714333f20` | 7 | yes | yes |
| `plugin-scientific-agent-skills-pylabrobot` | `ecaa13922c7f7f86949692da68cfd762a69e25a7d67c818b42562c8969d70bf6` | `e0518ed56165f6e2819f7b550b616141efa69ad4d3856bed55c596f4402c6b56` | 6 | yes | yes |
| `plugin-scientific-agent-skills-pymatgen` | `4e87b857411d94178a232cc31e2fd04ffce5556af4888ddb74a421b27a7f4a61` | `9f7622e1541ff5828cec6dfbb5596b9eb0665bd24aa1a1d1e699261f53b4e0a4` | 8 | yes | yes |
| `plugin-scientific-agent-skills-pymoo` | `8bb2647e5155d845707f7a2c6c63a64d1ea176c27577ead2aae5abf863236400` | `7afdfecb8797e42853792e2994df6326c6c0bbd0d38dfc1c6005e8468a418dc8` | 11 | yes | yes |
| `plugin-scientific-agent-skills-pytorch-lightning` | `a7e03ffc2fc7ff8e2252914a5e82fb108b622e6af818e6e3566badd731e144f4` | `1ecde326a531465da224641af07f437a7cb1e42659cb51d700c0ac31e27c1431` | 10 | yes | yes |
| `plugin-scientific-agent-skills-pyzotero` | `8a85b701707f22a5898901b314e01d53ca64fcf5117c583191000d85ff3eac6b` | `a8a98a066f691a4cb89bd3ca27c7b82e48bf83b32bc9c8f37680a4a5fc2eba89` | 14 | yes | yes |
| `plugin-scientific-agent-skills-qiskit` | `bd7ead2aa1ee34ca302af92806886c61aad0e7909751631602a331c2c27d7495` | `2db490a27dea3ba28c27523349315384788e28dd99554e5a158c8a63dc3e25ac` | 8 | yes | yes |
| `plugin-scientific-agent-skills-qutip` | `09de58e57cd310bdac0064e381cf55575c708c291dd894049a6c7fc1542765d6` | `624dc5d1d20f2ac8c12a4875184164d5ab1b3ba7249812d32119e5f64233287b` | 5 | yes | yes |
| `plugin-scientific-agent-skills-scientific-schematics` | `8c87abc54f31acaa89aecc42dc1f64a7f87ad6d5d6fa623d212d22aed1ea3270` | `da86d124d6c428cd69b82cae08f6f9d2a8655afa5e87d405a7b72f5ef9c04cb6` | 1 | yes | yes |
| `plugin-scientific-agent-skills-scientific-slides` | `3188d6012705d640b38ca5cf21419a7587b1a06aa6938c3fe61a1ccdaf1d5ab1` | `b255cb6e4f4678001e9b73c75e1acb6281fb840e991c7d3ac4ac5b2cfbe811b5` | 14 | yes | yes |
| `plugin-scientific-agent-skills-scientific-visualization` | `b04661d9a889528909fae583309023457a9c782ab1bf711140c8db17275398c2` | `8b59a777792a5ff48d2ef1119d18bc7ab3fc484553df0203a98f9ec5f358c7f5` | 10 | yes | yes |
| `plugin-scientific-agent-skills-scikit-learn` | `3811b2b6b916842f6218b0ae1b0205c639e2e7321feac9d1c5fcda722d6ee8d6` | `0ff407485fd2203d9e95089643f6e9a692d363c107007a85648c93b4a52216e5` | 8 | yes | yes |
| `plugin-scientific-agent-skills-seaborn` | `5d980d425fb5bc56c1ac26ea3c83811509207a08b9915abc8c298bbd07d4a494` | `7c29b46aa3161607712e7e7129422582288dc2ee41e18b7542e52d056c64cd36` | 3 | yes | yes |
| `plugin-scientific-agent-skills-shap` | `d829876b3857f718ed3d6e954e9ea2e3575591ab87ac118702f85758b054b3d9` | `f7bf9cd92797fc89b38a363d6a158e31b13186889c6486dbc17a7fe8527b0f2e` | 4 | yes | yes |
| `plugin-scientific-agent-skills-simpy` | `2fd0363164687ba84caae70280dadbcb08e22dfa4db1516d77d33aa3b2d315ae` | `e9cbe4f2c762897c7cef7cc343429f4fd4d47f2ac23af20698d05becf9b04523` | 7 | yes | yes |
| `plugin-scientific-agent-skills-stable-baselines3` | `9cafa11a73094a26b0142bd69849d9867d60abdb5c5f74530528c100693603ef` | `3b60cb4d5f0a84726a04215faa78a1fb82174c3358757c244450c92c8a602928` | 7 | yes | yes |
| `plugin-scientific-agent-skills-sympy` | `b04675a97f694cc74aacd8ed4fe0ff0f7efcefbd360816b0d30bf576ecb3ce66` | `d2b5683ca7e9ee1249e408c4ccc971b17d6ac6f1cdbf55a9be2dadec774f1df6` | 5 | yes | yes |
| `plugin-scientific-agent-skills-timesfm-forecasting` | `c4366a24698030d0d64409ae935a4f1690a609b9a1a154631fc40dcce777a700` | `1edf09bf1411d55bcc35dee938d93cf14d71079bf9c0630500bb614d083bd99a` | 26 | yes | yes |
| `plugin-scientific-agent-skills-torch-geometric` | `98a77949891f5e6843382124d7d97844468c43ca1d252ccc1f46fe1d527d1113` | `c03a4b5fdba3fc0ba90b067a05f97935d2deb66f33e81854b543257211e93b7e` | 6 | yes | yes |
| `plugin-scientific-agent-skills-transformers` | `4b82ee57b371db700561cb7a66300be286540e4547a599248c6c73ed63b462f1` | `e4536afa73bd2fd3c6a4c51320c01c8a21b0057bf529b496586058ffea815013` | 5 | yes | yes |
| `plugin-scientific-agent-skills-umap-learn` | `dea56c77fd9d57b63e1a8c223ad792995562c0a1c59871b41b2a3cddb302b32f` | `5a25f9a251f9a2e76db1f439033e37c7d0a7bccf0a96d262c430755f2c94e540` | 1 | yes | yes |
| `plugin-scientific-agent-skills-venue-templates` | `51d1be60769c2070b01b71e81dbde071b510f8e1ab2e3c67d2674253b1a8809c` | `afc29cf1af32b733ef9d1c0dcabfa6e07d7fccd19d8679b21803191e14f77039` | 30 | yes | yes |

## Machine Review Artifact

| artifact | path | sha256 |
|---|---|---|
| extension review | `audits/scientific-agent-skills/v2.53.0/artifacts/extension-review.json` | `109ee0cb11f3d00ce426a010a6192969b645a07d93bad0cfc5adc335e181ad7d` |

## Human Confirmation

- [x] 49 个上游语义义务均由 extension SKILL 或 graph profile 承接。
- [x] extension SKILL 不含 next-node / next-phase / agent-team orchestration。
- [x] 命名、registry、审计记录、锚点 manifest 身份一致。
- [x] Agent 语义审阅见 `05-semantic-review.md`。
