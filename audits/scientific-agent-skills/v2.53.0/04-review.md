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
| `plugin-scientific-agent-skills-aeon` | `74599f5dc4a388836469b2c3254789735f610822e8c35844c6a7cfdb869e35b6` | `ad7fc7838bbad822dfa343750222de1efd06920ace7d296f298aa1e56cd552e4` | 11 | yes | yes |
| `plugin-scientific-agent-skills-astropy` | `a7a46078b8544986211410b174462ef2d7479f111cb57b8afee64bf7a62fc69d` | `de8cdadeda6f83558e71ed75352921c8b34d62f481ec4550589385b2782dc66e` | 7 | yes | yes |
| `plugin-scientific-agent-skills-benchling-integration` | `af61474844b2bdabd051da6fe1679f1dc09a28955c7e011006962a9742a60ae1` | `f6fca0c475542e946d654e56f3b49f18f81eab57a4fd747d04f36d1ebf4c3724` | 4 | yes | yes |
| `plugin-scientific-agent-skills-cirq` | `9a9d93d8d57f380e6539621ce429a79b8590dd93e68f6157d02f9dbaf2b104f4` | `75619696bec6a10fc806d78f5c602bfec3b27541b06ef58a49b67439adee7ac6` | 6 | yes | yes |
| `plugin-scientific-agent-skills-fluidsim` | `c7c7d475b925197321c2a70473065c5ffb9bea2fc358cc52e84ea08ce10247d0` | `17c28bbf59f832e09d781da0a327176499cd93afb9cad4cb71c1cd3ec81a08f8` | 6 | yes | yes |
| `plugin-scientific-agent-skills-generate-image` | `d692297b222a6ea4c77e9a861b4d483d89d3ae2412e6589fc4cf0adb73eceec4` | `34818885084cfb22cc86319bdbb07454ad7eee78ac0320a1f4fecef1bc912c60` | 1 | yes | yes |
| `plugin-scientific-agent-skills-geomaster` | `adb9e13d8a262107fc91beed6e3f67eddcfcd364095c3eabe4d11c2518c841ee` | `dfaf987eafd72137c28c62fefca7f365b1be73a3181dec427de384b8c8f769a7` | 15 | yes | yes |
| `plugin-scientific-agent-skills-geopandas` | `20283cf5726169b4935d233ac268f5a5443d924d2f3ad5bc0d4e3e1dfe4a03aa` | `1582a7f68d0239f480858fe1289f111d83fa97804bf6474973a6dc294d2af2a4` | 6 | yes | yes |
| `plugin-scientific-agent-skills-ginkgo-cloud-lab` | `fe856544fa2b7fa7eb6e73bb85221e85290c97e7f0ab0ac61270c807e7959003` | `c998e9e781860d915bc3e0a052e67bd396549855366eafac6d5dfcf019331c90` | 17 | yes | yes |
| `plugin-scientific-agent-skills-infographics` | `f3c3e2b7ac1907ac0b1246e1d95bdd8e8294d524622eac2735ebcd01dd00d930` | `bc9f0ddfe578cc8497b5158901165cb722ae534a8a3d4c3bb692989aa930d33b` | 3 | yes | yes |
| `plugin-scientific-agent-skills-labarchive-integration` | `1749207854a11dd3041f124945a94e101455968b13b2aa2d577652f81e085b5e` | `7eb0da74b562733967766c3e9f5143248559899d8782ab398167a150a43ee8c5` | 6 | yes | yes |
| `plugin-scientific-agent-skills-latex-posters` | `d8144d7584f690ba16595003987466ac7f98927211af79b565921a673aa9d7ea` | `304dd3704ac953337d5ce1a20acc86beb79a6ac1b0b6900aacfe8fa04e8fdc8b` | 10 | yes | yes |
| `plugin-scientific-agent-skills-liteparse` | `27194efaa24dce36a7a3194587d9daa23f923d4bf3254273d1db5e21b9a4fe0b` | `2239de72c8cad062be4703d09d6f9ef0c1af3790ced53fcc0c9ebca125af9f32` | 6 | yes | yes |
| `plugin-scientific-agent-skills-markdown-mermaid-writing` | `a330f714d52b6345ec53bd3b67391b1629b38f2cf4a53293b072518d3e885e27` | `5572012b92e45d994596c779312299ef2945f4d455acd96c48556a07839d963b` | 36 | yes | yes |
| `plugin-scientific-agent-skills-markitdown` | `be97ffc651ddef9ef1ec551edb45cf9e3c12810bdca6e4b90c7e4370ce443482` | `a22414be86a094d0865e586bb227e2944e26168c99bdaaf8d1e876cd6834913a` | 5 | yes | yes |
| `plugin-scientific-agent-skills-matlab` | `48e0fbc4936f1e675d943ef21829af95668232ee41f0d4fa2dc0835993644bcf` | `6a04bc6aae10be04145feb58a7a1fd4c384bd38afc367f4cca5fefc8fa9f6e1d` | 8 | yes | yes |
| `plugin-scientific-agent-skills-matplotlib` | `f81f7af7c4e9577891b726061b7d9ac9096f37d654d1db6ff3de8653afa72de1` | `1c69886f19bbfae50119612abf6e9b1cebaca32be0879420b5d6e502f142b1b9` | 6 | yes | yes |
| `plugin-scientific-agent-skills-modal` | `162d864b1ed26b8c033ff1fc0cf4f08fedafe301ff66f0a42ba56b1676d2cbd0` | `ea54f92df7ce3c3f9ab281a7dcb258443e7b835fed03b33aa7580e23ce57999a` | 11 | yes | yes |
| `plugin-scientific-agent-skills-networkx` | `eb4a241bc7d62073668010d636ce6a65044f526fa8f8467c0a119f6852fdb2c5` | `7683f47da83ebc03915b70979176d9f1cf12a14dae44067e08b66128528dabca` | 5 | yes | yes |
| `plugin-scientific-agent-skills-open-notebook` | `2499f70bcbce01a14ac7a0c56ce56ce672f4dda5718cd65f26421402b3ee0bfd` | `3867eb720a6f8ea480a339fa201ca8fafd63bfe62bb418714673d4f151015ca8` | 7 | yes | yes |
| `plugin-scientific-agent-skills-opentrons-integration` | `0e80f0882d4f7e40ebe823656596e06acecd869c9da3777bbe2d9b7872c38f44` | `ddcbb4f2ba652b7b38d7520122864082b98de52e37c1092c239fb8b2e3bc9761` | 4 | yes | yes |
| `plugin-scientific-agent-skills-optimize-for-gpu` | `7db3a452ada7500eb13f8076b6ca45badf6759670c72ffdab4bbbf8f378acdd5` | `59c423123b60b0742986e8f3e70aea876c2598c660864367e9e074828ad1d40d` | 12 | yes | yes |
| `plugin-scientific-agent-skills-pacsomatic` | `988bab389456225afcd3affa76bc3dd3eabd75bcf38f24b2ce39f55f9a870518` | `9b0652244a02885ddc1b1e13a18527502db8699ab7985a845a99bcf49aa93494` | 4 | yes | yes |
| `plugin-scientific-agent-skills-parallel-web` | `86fdfa8e8ca8823f5538c9e325d451828d074d9f4486741cd557dd1fcb47c3d9` | `588cf7d466fbddcaa869951ab39bddd1872661e591ff629a86cfc95e0b63785e` | 0 | yes | yes |
| `plugin-scientific-agent-skills-pennylane` | `d2a3f8ea191283367c5c3326aaa7081e6d869c0c13f42343ee12c84737824b9d` | `a2386da94735ba7a2627e2ad7bcd69ff580d81fadaa9cc4507d37d7fd3a0c643` | 7 | yes | yes |
| `plugin-scientific-agent-skills-pptx-posters` | `a0063df89031bde0b11202ae69290091ccbfca10994c9760fc9c22c73bbad124` | `c3e311f6421817fb4ff8672b9b376c0b0eea6b8c30ed0cc21f8d80a1be66a3f7` | 5 | yes | yes |
| `plugin-scientific-agent-skills-protocolsio-integration` | `58b8ab549ac46c0cae10265d9cbbfcd30ab1504d898e69f8d67bc418660735fc` | `6562b92e58a617e6b4301d07f1e41fd7cd6d19fbf078880122393bb3dd61ceb5` | 6 | yes | yes |
| `plugin-scientific-agent-skills-pufferlib` | `9f41a99a4bf78a92267a8884f3a446e3e2286962561f183708df3e6764c5809b` | `c8c98524eb94b34d1e21b068a188e372efb4afc1c766b2f24e77f2b714333f20` | 7 | yes | yes |
| `plugin-scientific-agent-skills-pylabrobot` | `0dd6919eb24b2526b398486ffa776df193e9791261bbfb322fa319bffe8b5c82` | `e0518ed56165f6e2819f7b550b616141efa69ad4d3856bed55c596f4402c6b56` | 6 | yes | yes |
| `plugin-scientific-agent-skills-pymatgen` | `7815a52378748a9c422b7dbe16c64649902c913c07e0aff30eb2d7e153109768` | `9f7622e1541ff5828cec6dfbb5596b9eb0665bd24aa1a1d1e699261f53b4e0a4` | 8 | yes | yes |
| `plugin-scientific-agent-skills-pymoo` | `19a28a9b0c0a078e41bb15c96da9cc16f2bd67fc02e0634af3f3380417d08657` | `7afdfecb8797e42853792e2994df6326c6c0bbd0d38dfc1c6005e8468a418dc8` | 11 | yes | yes |
| `plugin-scientific-agent-skills-pytorch-lightning` | `91b13a6544ea9cfc80fc6eebde63de70d5b88e48949a282f311e2bb97c726f8c` | `1ecde326a531465da224641af07f437a7cb1e42659cb51d700c0ac31e27c1431` | 10 | yes | yes |
| `plugin-scientific-agent-skills-pyzotero` | `74bf6e644e64c94288b1adcb72dd2b0a82cdb153e39f21841d9c79ad2f9cb774` | `a8a98a066f691a4cb89bd3ca27c7b82e48bf83b32bc9c8f37680a4a5fc2eba89` | 14 | yes | yes |
| `plugin-scientific-agent-skills-qiskit` | `30faf881d4b822a534e57ab5ce8c94508c86500e8792ce52aaa11a35d3d55e4d` | `2db490a27dea3ba28c27523349315384788e28dd99554e5a158c8a63dc3e25ac` | 8 | yes | yes |
| `plugin-scientific-agent-skills-qutip` | `bc9127336c78c2e40f569b8ce3a0477f951eb1ed5f1bbcc1104942da5b260346` | `624dc5d1d20f2ac8c12a4875184164d5ab1b3ba7249812d32119e5f64233287b` | 5 | yes | yes |
| `plugin-scientific-agent-skills-scientific-schematics` | `483640afc9580dbc5c589cf6b9f9d4c1be04c38a7e89caeddf12fb683a8cbdbb` | `da86d124d6c428cd69b82cae08f6f9d2a8655afa5e87d405a7b72f5ef9c04cb6` | 1 | yes | yes |
| `plugin-scientific-agent-skills-scientific-slides` | `cdfa58b65444e0f9b5e949d12a09138cafdfbbdf72caf9a74160efe9da8a4434` | `b255cb6e4f4678001e9b73c75e1acb6281fb840e991c7d3ac4ac5b2cfbe811b5` | 14 | yes | yes |
| `plugin-scientific-agent-skills-scientific-visualization` | `44fb9ff2634e8d983547dcd35bdf36c1c4e5912f023d096c94f64c082d79a276` | `8b59a777792a5ff48d2ef1119d18bc7ab3fc484553df0203a98f9ec5f358c7f5` | 10 | yes | yes |
| `plugin-scientific-agent-skills-scikit-learn` | `09dc007c1443d79132f8cb4d7afce5bd9e69f91db3ae4a150a6b16d971fe130e` | `0ff407485fd2203d9e95089643f6e9a692d363c107007a85648c93b4a52216e5` | 8 | yes | yes |
| `plugin-scientific-agent-skills-seaborn` | `9ab074a99fe14212a73c9aa1c12aa9de4509f2c569c894addbf042622cc07b06` | `7c29b46aa3161607712e7e7129422582288dc2ee41e18b7542e52d056c64cd36` | 3 | yes | yes |
| `plugin-scientific-agent-skills-shap` | `e9e39811bc5cd99ac28dbd39bae4429d5bfd0dba4f3c2e0174f2eab9af898ce9` | `f7bf9cd92797fc89b38a363d6a158e31b13186889c6486dbc17a7fe8527b0f2e` | 4 | yes | yes |
| `plugin-scientific-agent-skills-simpy` | `87269612fbfd893f01048ba4da292905f67ca82e184c22faaa7701cc2d03978b` | `e9cbe4f2c762897c7cef7cc343429f4fd4d47f2ac23af20698d05becf9b04523` | 7 | yes | yes |
| `plugin-scientific-agent-skills-stable-baselines3` | `67ef35271d405b643fbf105c53f908ac7332842684cbbd9a9e8e8350c357858f` | `3b60cb4d5f0a84726a04215faa78a1fb82174c3358757c244450c92c8a602928` | 7 | yes | yes |
| `plugin-scientific-agent-skills-sympy` | `f4714b6d1a3b06b552be01607c57cc74e0f57ec79119cced5d3b501e511f5b6d` | `d2b5683ca7e9ee1249e408c4ccc971b17d6ac6f1cdbf55a9be2dadec774f1df6` | 5 | yes | yes |
| `plugin-scientific-agent-skills-timesfm-forecasting` | `f97c3673888ad26be04a0d31ade0b54d5ab7b48d0e91354f635f8b4f80b803e7` | `1edf09bf1411d55bcc35dee938d93cf14d71079bf9c0630500bb614d083bd99a` | 26 | yes | yes |
| `plugin-scientific-agent-skills-torch-geometric` | `4091194899757b64a8db5dc54e3c29e06f2c3852f3b278b22e03680d9ac2f3bd` | `c03a4b5fdba3fc0ba90b067a05f97935d2deb66f33e81854b543257211e93b7e` | 6 | yes | yes |
| `plugin-scientific-agent-skills-transformers` | `c37bc53e054231799c9aab08d8622539220a165b2e5dac3e187ef6d7f7989673` | `e4536afa73bd2fd3c6a4c51320c01c8a21b0057bf529b496586058ffea815013` | 5 | yes | yes |
| `plugin-scientific-agent-skills-umap-learn` | `ec270b5e9b91c774aa8d90047a9b825d311f1e6281c3eca8d23f213f405bf14b` | `5a25f9a251f9a2e76db1f439033e37c7d0a7bccf0a96d262c430755f2c94e540` | 1 | yes | yes |
| `plugin-scientific-agent-skills-venue-templates` | `52717fd517108036ceb7327a566469391462e22abac4340f133da337cc78ad2c` | `afc29cf1af32b733ef9d1c0dcabfa6e07d7fccd19d8679b21803191e14f77039` | 30 | yes | yes |

## Machine Review Artifact

| artifact | path | sha256 |
|---|---|---|
| extension review | `audits/scientific-agent-skills/v2.53.0/artifacts/extension-review.json` | `45d25644df85fd9f0d0d01cad3a4ee9c54ad8767697ebd167fb1429d54f65db0` |

## Human Confirmation

- [x] 49 个上游语义义务均由 extension SKILL 或 graph profile 承接。
- [x] extension SKILL 不含 next-node / next-phase / agent-team orchestration。
- [x] 命名、registry、审计记录、锚点 manifest 身份一致。
- [x] Agent 语义审阅见 `05-semantic-review.md`。
