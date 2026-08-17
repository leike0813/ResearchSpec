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
| `plugin-scientific-agent-skills-aeon` | `9f10f6eccea4264abdf1d4578b507190812cae9f043bd378b216b0f38fef70f0` | `ad7fc7838bbad822dfa343750222de1efd06920ace7d296f298aa1e56cd552e4` | 11 | yes | yes |
| `plugin-scientific-agent-skills-astropy` | `d19f0958f8670a7219c027bba1cdfc19fbb2ffd836112041b23172dcca2a3a9b` | `de8cdadeda6f83558e71ed75352921c8b34d62f481ec4550589385b2782dc66e` | 7 | yes | yes |
| `plugin-scientific-agent-skills-benchling-integration` | `60859cce42be987ebfc40a82e3b4012c7c19abb9a6d1dc9cb9fd2cf38659daa2` | `f6fca0c475542e946d654e56f3b49f18f81eab57a4fd747d04f36d1ebf4c3724` | 4 | yes | yes |
| `plugin-scientific-agent-skills-cirq` | `7cc3f1aef00e62c8830b38997845a2812611a3eaa3e37b534b1804ed2f9cb75c` | `75619696bec6a10fc806d78f5c602bfec3b27541b06ef58a49b67439adee7ac6` | 6 | yes | yes |
| `plugin-scientific-agent-skills-fluidsim` | `8e53494e19fbf1fd381ad5dce47019be7a8306c26df7102591592ef4dd4d1259` | `17c28bbf59f832e09d781da0a327176499cd93afb9cad4cb71c1cd3ec81a08f8` | 6 | yes | yes |
| `plugin-scientific-agent-skills-generate-image` | `83537447b80958fda92cb23f90a19b4e9686d587d196695ec986f2fdc8d82172` | `34818885084cfb22cc86319bdbb07454ad7eee78ac0320a1f4fecef1bc912c60` | 1 | yes | yes |
| `plugin-scientific-agent-skills-geomaster` | `912667daaa1556d99317dbb214ca0e9c288b914c9deca56772aaa1224b5b6d20` | `dfaf987eafd72137c28c62fefca7f365b1be73a3181dec427de384b8c8f769a7` | 15 | yes | yes |
| `plugin-scientific-agent-skills-geopandas` | `972f6d1a5f26c5ab2c0ca064081fa983307275562d18fcbbb8923f09eb15cf01` | `1582a7f68d0239f480858fe1289f111d83fa97804bf6474973a6dc294d2af2a4` | 6 | yes | yes |
| `plugin-scientific-agent-skills-ginkgo-cloud-lab` | `887d82abdbea61c7fd071e231adc29095c2a24edf56955fbb3fee995a9455d9c` | `c998e9e781860d915bc3e0a052e67bd396549855366eafac6d5dfcf019331c90` | 17 | yes | yes |
| `plugin-scientific-agent-skills-infographics` | `66842109ded0aa0c5775d0e37e70a86c383cd4fe5526ad70ba22b225d66e0e36` | `bc9f0ddfe578cc8497b5158901165cb722ae534a8a3d4c3bb692989aa930d33b` | 3 | yes | yes |
| `plugin-scientific-agent-skills-labarchive-integration` | `4a8538f9ac03729a74f3b54b94b040a41898b9c10c47a5b59257d613e94fbfbe` | `7eb0da74b562733967766c3e9f5143248559899d8782ab398167a150a43ee8c5` | 6 | yes | yes |
| `plugin-scientific-agent-skills-latex-posters` | `0e29422d97566cf80c454c86b678e3c3fbb78efb3c95d5e3186adfd885a0f1b9` | `304dd3704ac953337d5ce1a20acc86beb79a6ac1b0b6900aacfe8fa04e8fdc8b` | 10 | yes | yes |
| `plugin-scientific-agent-skills-liteparse` | `5b8833953ad167703e71f3a5444432e8aa469580a359f420782b2f5427a29057` | `2239de72c8cad062be4703d09d6f9ef0c1af3790ced53fcc0c9ebca125af9f32` | 6 | yes | yes |
| `plugin-scientific-agent-skills-markdown-mermaid-writing` | `065a21dde4270f1b79d94095334bedd25849e32ce1f72f8adc1d484d0f4b50d9` | `5572012b92e45d994596c779312299ef2945f4d455acd96c48556a07839d963b` | 36 | yes | yes |
| `plugin-scientific-agent-skills-markitdown` | `a6d76f9111b44f3a58815ef59e038f5e970142ea4d9c7112c5930f7295237596` | `a22414be86a094d0865e586bb227e2944e26168c99bdaaf8d1e876cd6834913a` | 5 | yes | yes |
| `plugin-scientific-agent-skills-matlab` | `8ac9b4f363e74a3280b425fd9422db4f40ce037ef7d01310f97174682ddf72e2` | `6a04bc6aae10be04145feb58a7a1fd4c384bd38afc367f4cca5fefc8fa9f6e1d` | 8 | yes | yes |
| `plugin-scientific-agent-skills-matplotlib` | `0373c49a1e4dd2ceffd30a27bccf90ffe45dca2a485202bec392fba0c673cb31` | `1c69886f19bbfae50119612abf6e9b1cebaca32be0879420b5d6e502f142b1b9` | 6 | yes | yes |
| `plugin-scientific-agent-skills-modal` | `d2ab96b5559c033089bd64b48459fe0e11ebb06678cca88c029ed3e15ede7f2e` | `ea54f92df7ce3c3f9ab281a7dcb258443e7b835fed03b33aa7580e23ce57999a` | 11 | yes | yes |
| `plugin-scientific-agent-skills-networkx` | `8ee4f7b53d532b51c22e5efccb720745cf9455af42e5c5584caf4868c2e0bc1e` | `7683f47da83ebc03915b70979176d9f1cf12a14dae44067e08b66128528dabca` | 5 | yes | yes |
| `plugin-scientific-agent-skills-open-notebook` | `2a5cecfc263e10aa3d62b336a5e2ff7fda3c6a26f26ba26627fbb5e0e6dff674` | `3867eb720a6f8ea480a339fa201ca8fafd63bfe62bb418714673d4f151015ca8` | 7 | yes | yes |
| `plugin-scientific-agent-skills-opentrons-integration` | `1050a3246fabb98ff47cf56b2c572c99ed94573fd1d0fb47a876f3a7d2b63015` | `ddcbb4f2ba652b7b38d7520122864082b98de52e37c1092c239fb8b2e3bc9761` | 4 | yes | yes |
| `plugin-scientific-agent-skills-optimize-for-gpu` | `70521f1303bf52a9f94aa73a4d5db144862f7108720583ff2a2725819623a43d` | `59c423123b60b0742986e8f3e70aea876c2598c660864367e9e074828ad1d40d` | 12 | yes | yes |
| `plugin-scientific-agent-skills-pacsomatic` | `b19743cefcbfc2a2893d8214c42b985bca66b3b31b5a29ab1b963381f0d59600` | `9b0652244a02885ddc1b1e13a18527502db8699ab7985a845a99bcf49aa93494` | 4 | yes | yes |
| `plugin-scientific-agent-skills-parallel-web` | `42aa74fbe351efd75632ba36e3b3551391b888e3a94460e162d32e6aa25cdfb5` | `588cf7d466fbddcaa869951ab39bddd1872661e591ff629a86cfc95e0b63785e` | 0 | yes | yes |
| `plugin-scientific-agent-skills-pennylane` | `90393ba2b10e18aad517158fe013bc663537915dd91f3373a0960fe11cc5f805` | `a2386da94735ba7a2627e2ad7bcd69ff580d81fadaa9cc4507d37d7fd3a0c643` | 7 | yes | yes |
| `plugin-scientific-agent-skills-pptx-posters` | `adcb741f67f2a6558694588ba53e584aefd32a063b934e81aa1022e6d21fb00a` | `c3e311f6421817fb4ff8672b9b376c0b0eea6b8c30ed0cc21f8d80a1be66a3f7` | 5 | yes | yes |
| `plugin-scientific-agent-skills-protocolsio-integration` | `9678bfe3a338b0a3d46673c1d9ca8993acba64193ebd0fb536ae4d38055853cd` | `6562b92e58a617e6b4301d07f1e41fd7cd6d19fbf078880122393bb3dd61ceb5` | 6 | yes | yes |
| `plugin-scientific-agent-skills-pufferlib` | `2bb3262b0a7f1621fdf069709cb128c1d3af8e7a9c16d128bf818c9703bc9429` | `c8c98524eb94b34d1e21b068a188e372efb4afc1c766b2f24e77f2b714333f20` | 7 | yes | yes |
| `plugin-scientific-agent-skills-pylabrobot` | `00cd09a3b146908fcb9df3fe8f542c21dd1e6bdec2c3bcce040ea3dc6246443d` | `e0518ed56165f6e2819f7b550b616141efa69ad4d3856bed55c596f4402c6b56` | 6 | yes | yes |
| `plugin-scientific-agent-skills-pymatgen` | `6d0b8480fbe60c8c8b552be4b38f24e4cca31a55ca8c88aa48289da9e5bb28c3` | `9f7622e1541ff5828cec6dfbb5596b9eb0665bd24aa1a1d1e699261f53b4e0a4` | 8 | yes | yes |
| `plugin-scientific-agent-skills-pymoo` | `ba740188af5f85d8dc6c2ddf86ae4c9b16c1796bc4fec4e31b6d2d8fbaf3fd6a` | `7afdfecb8797e42853792e2994df6326c6c0bbd0d38dfc1c6005e8468a418dc8` | 11 | yes | yes |
| `plugin-scientific-agent-skills-pytorch-lightning` | `df37dc57853f1b3c45277abe420bebeaac11572452d7f3ae975e39641f30d2b1` | `1ecde326a531465da224641af07f437a7cb1e42659cb51d700c0ac31e27c1431` | 10 | yes | yes |
| `plugin-scientific-agent-skills-pyzotero` | `8dda29a7166ba0b8db4764f5a98056b8877d5d341266f04cba05c720ccc3a56e` | `a8a98a066f691a4cb89bd3ca27c7b82e48bf83b32bc9c8f37680a4a5fc2eba89` | 14 | yes | yes |
| `plugin-scientific-agent-skills-qiskit` | `969749a3b60ab58e783e493d021c03b1bfd2b89a0412d3a7b9897687033545da` | `2db490a27dea3ba28c27523349315384788e28dd99554e5a158c8a63dc3e25ac` | 8 | yes | yes |
| `plugin-scientific-agent-skills-qutip` | `2975c53be92dda2aad390f76811be6767c9298dcf38d82a44c0d684ab94930ea` | `624dc5d1d20f2ac8c12a4875184164d5ab1b3ba7249812d32119e5f64233287b` | 5 | yes | yes |
| `plugin-scientific-agent-skills-scientific-schematics` | `20db334fdb48e008ffabb7ad6870281223a84ca40ce85ade2ba9086e98cc78b5` | `da86d124d6c428cd69b82cae08f6f9d2a8655afa5e87d405a7b72f5ef9c04cb6` | 1 | yes | yes |
| `plugin-scientific-agent-skills-scientific-slides` | `e12adc3b5df93846af42076873b79cbdfb59a385d34485a2a46347f564b31c22` | `b255cb6e4f4678001e9b73c75e1acb6281fb840e991c7d3ac4ac5b2cfbe811b5` | 14 | yes | yes |
| `plugin-scientific-agent-skills-scientific-visualization` | `672b09d0a82b5f3c5ae288d6479146d3af75dec25063d2f48084b8994670624d` | `8b59a777792a5ff48d2ef1119d18bc7ab3fc484553df0203a98f9ec5f358c7f5` | 10 | yes | yes |
| `plugin-scientific-agent-skills-scikit-learn` | `02530ee0722c6a397715f333c68b2cd68fb4d5d09ad09ef221614fc35c2c9a05` | `0ff407485fd2203d9e95089643f6e9a692d363c107007a85648c93b4a52216e5` | 8 | yes | yes |
| `plugin-scientific-agent-skills-seaborn` | `4c97dc804d6bae0f38ff3c96465c37969d1d41f00d384bb1ae179920ec1ebbbf` | `7c29b46aa3161607712e7e7129422582288dc2ee41e18b7542e52d056c64cd36` | 3 | yes | yes |
| `plugin-scientific-agent-skills-shap` | `288987f7df4dcfbca7b3a27505a95ee42cfdc39b9cde7536f0463e7785904811` | `f7bf9cd92797fc89b38a363d6a158e31b13186889c6486dbc17a7fe8527b0f2e` | 4 | yes | yes |
| `plugin-scientific-agent-skills-simpy` | `b620460e338d8de5283c5c2d9e25ba318be5615da1dd10639c51b9b2c26025bd` | `e9cbe4f2c762897c7cef7cc343429f4fd4d47f2ac23af20698d05becf9b04523` | 7 | yes | yes |
| `plugin-scientific-agent-skills-stable-baselines3` | `bda89ae9243c3647eafd306b525114b7e35e700f2f539a757cc695bd065c5870` | `3b60cb4d5f0a84726a04215faa78a1fb82174c3358757c244450c92c8a602928` | 7 | yes | yes |
| `plugin-scientific-agent-skills-sympy` | `b48b31194de43a05cc21f1563a12ebd51c25d6ce07517e45c40b7bb03257a885` | `d2b5683ca7e9ee1249e408c4ccc971b17d6ac6f1cdbf55a9be2dadec774f1df6` | 5 | yes | yes |
| `plugin-scientific-agent-skills-timesfm-forecasting` | `5c6d7e923d220649d8bb5d8fc91e42fbff02b058f1bf1e186cef7f1c4efda47c` | `1edf09bf1411d55bcc35dee938d93cf14d71079bf9c0630500bb614d083bd99a` | 26 | yes | yes |
| `plugin-scientific-agent-skills-torch-geometric` | `85b4e39bfd02a3ea955b89a5f6a7fbd39c1ae339c833fbd15ddf40a3335f0d91` | `c03a4b5fdba3fc0ba90b067a05f97935d2deb66f33e81854b543257211e93b7e` | 6 | yes | yes |
| `plugin-scientific-agent-skills-transformers` | `f5ecc75f525e56cb9c913cbfa90da4f7e29e3fa3b020352a3d34292b2de0a6d8` | `e4536afa73bd2fd3c6a4c51320c01c8a21b0057bf529b496586058ffea815013` | 5 | yes | yes |
| `plugin-scientific-agent-skills-umap-learn` | `e5be72953c8b13393fa444d8f9a2e8b9105c1040e640af499e5edb34fd70f793` | `5a25f9a251f9a2e76db1f439033e37c7d0a7bccf0a96d262c430755f2c94e540` | 1 | yes | yes |
| `plugin-scientific-agent-skills-venue-templates` | `7d3d9200d8b9d65572f0e9eab1dce8edc541d9a32c0407fdcb4c5347b7c8b44a` | `afc29cf1af32b733ef9d1c0dcabfa6e07d7fccd19d8679b21803191e14f77039` | 30 | yes | yes |

## Machine Review Artifact

| artifact | path | sha256 |
|---|---|---|
| extension review | `audits/scientific-agent-skills/v2.53.0/artifacts/extension-review.json` | `2c4721595f12070f4d553677b5d8dff73d5101a9eb25767fc3a51b80530cc724` |

## Human Confirmation

- [x] 49 个上游语义义务均由 extension SKILL 或 graph profile 承接。
- [x] extension SKILL 不含 next-node / next-phase / agent-team orchestration。
- [x] 命名、registry、审计记录、锚点 manifest 身份一致。
- [x] Agent 语义审阅见 `05-semantic-review.md`。
