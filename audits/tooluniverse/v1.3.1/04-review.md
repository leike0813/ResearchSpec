# ToolUniverse Extension Anchor Review — v1.3.1

## Registry And Domain Review

- capability entries: 130
- profile entries: 130
- ToolUniverse 领域分配由 `src/plugins/domain-catalog.json` 自动镜像
- 每个领域只包含其 reviewed raw Skills 对应 extension
- extension capability IDs 与 raw Skill IDs 不冲突；与 bundled capabilities 不冲突。

## Package Review

| capability_id | package tree SHA-256 | profile SHA-256 | tool files | tools byte-identical | required fields bound |
|---|---|---|---|---|---|
| `plugin-tooluniverse-acmg-variant-classification` | `4f47a381a96c2467daadcfc2cc86d92861ce7807408fc4bb68021cf1cb4aadc4` | `9cb2cf5f00ecf224cf7eb5c27856a04f76eb13adb5c91c927e4a5f7062396c2b` | 0 | yes | yes |
| `plugin-tooluniverse-admet-prediction` | `30a66741655ea207dd582cb4606a9ab44acce495b86db9ff3d1d615ab2efd384` | `478b4a4f591c35df33d11b5dff922d9b944966ba333573a475159a8f57d02fb0` | 0 | yes | yes |
| `plugin-tooluniverse-adverse-event-detection` | `866f2fb06c3fd48aab5a43a834e6337d8652a33c601498a657088eace644a677` | `d651e8280ced640469701c4a239e9d70d426162d991f850b009535099e1ed7e0` | 4 | yes | yes |
| `plugin-tooluniverse-adverse-outcome-pathway` | `731f1a91b104adbf84604f6bdeaae710b101c630bb56539adb682342e05f8e54` | `a1e22a251693c28e7e366e512aea2ae888c0c5823e31d0b4626dff0e70fa7502` | 0 | yes | yes |
| `plugin-tooluniverse-aging-senescence` | `d96ed84f06a2d1dfd0f1aaad6eff167639eacf397aef9fa1f8bc58f614322bd3` | `686ed247ff738d79ae6802763cecdb6048d72e6cdec577fcac2f1c4032959cd8` | 0 | yes | yes |
| `plugin-tooluniverse-antibody-engineering` | `5367310818336ea487a6cc2f9864d0878155fc70a7bed88a240e3b2d96ebf5f3` | `51a68a5dae94e63e9bd7b18c877d3e7393cf0762bedd6cf71ca091f026e32ec8` | 7 | yes | yes |
| `plugin-tooluniverse-binder-discovery` | `4116feb61c96e8e6a1d2e6ab9ab75a7159927bd309f3308d0a059b4156d9b2ac` | `006b1ccfcc1275d2d75459ca40ed15a394dac57dea067e1241744b9e5d2c8c46` | 5 | yes | yes |
| `plugin-tooluniverse-cancer-classification` | `daf9947ea3f0dfd3606cb10501ea89bb94ae3b85643dc9ca5e5220be74cd03c1` | `5f73232d7319b1db95b048dc0fc40b9e2c996e438fc6d0ca4ca7e8ab29d922dc` | 0 | yes | yes |
| `plugin-tooluniverse-cancer-genomics-tcga` | `0217ea281b494a61fad3ddb2fb1f8bb57e5023e68e7e5b807d474bef7a54ec94` | `93252bb130f247228f2b2518869bb4748b79015f316bfc1d4e89c9203901bd49` | 0 | yes | yes |
| `plugin-tooluniverse-cancer-variant-interpretation` | `5d7144f0b4033501806ccfe84c458d8ea73bc1ee0aad6d3e57543a5a432638e0` | `68bf82499204b30be0c825e6afabce3e4d6f0bda7db7f16d67a69c038f22823e` | 7 | yes | yes |
| `plugin-tooluniverse-cell-line-profiling` | `d5287edeadee0e19cd0587fe10dcbe5d6d28b2305de70ef796088ea388f15597` | `c9ecf59fdd873b2d68deb8987122ebebf7d4b6d0b75fb74b714c845a0d4c965c` | 1 | yes | yes |
| `plugin-tooluniverse-chemical-compound-retrieval` | `aa54ec92b8940481041102b120ac8959241d55c2ba2a478e6346430fea513a9d` | `1e656fc2fe845ba6c14163427a74f0dcf4645299e017ca3dc1048f1317c1e7de` | 2 | yes | yes |
| `plugin-tooluniverse-chemical-safety` | `c53a03376780d9029a5cf0da3a60ca825913ad1699e0388fdcf5ca837d0309ec` | `fe9c96821d68e75b07b656a0de7452515203595edffd39b048f626eb69cfe95d` | 4 | yes | yes |
| `plugin-tooluniverse-chemical-sourcing` | `01785d7f039aebbb22ffd27b1df36a37293a814587ff6adef48414dea71edbec` | `dd26161461a2bf461fb60aa2b3017b19cc18d83d6caac42c74998821fac88f94` | 0 | yes | yes |
| `plugin-tooluniverse-clinical-data-integration` | `1bdfb8537b3b7259a586f4c3a6f6c6dce9b7e4c6a8cad95ee444857a7cc905f7` | `6ebaa61af6fa8c6cbce7346f48d138c20647e45e16e7230b9f8a2f7e96767e06` | 0 | yes | yes |
| `plugin-tooluniverse-clinical-guidelines` | `91c244c0a286103cbca27c76cc6d0443575fb5b287a704f7dbb0152b7e654653` | `ed62ae9356ec4a52e5a2150badc31b52df99719a89db8e7d65675c552019dfaf` | 1 | yes | yes |
| `plugin-tooluniverse-clinical-risk-scoring` | `9db025c8e99fe666c4adf0bebcd7a8aca30ad55cc276b9fcc2c558a3e796f335` | `08436ef620d2b0ea0cfed0798b5d5c44c4d841eef56f67f8f33a5fb7d1c74781` | 0 | yes | yes |
| `plugin-tooluniverse-clinical-trial-design` | `44a087f9bda2a7f6d55e70b6eabac87485a22fdf3a68fef57bbfefd8221acb25` | `d183445e60121350dae3ce0484985216c2ca72ac6594932b5c4fc4a40859078a` | 8 | yes | yes |
| `plugin-tooluniverse-clinical-trial-matching` | `c48e934124474acd3295ab202150f6190b9e04640f73c642a0d9ebd6b6e4d27f` | `df1716dc46465ac91d9ab674c73426532fd4620afb5a289566e045ccfa6c4647` | 7 | yes | yes |
| `plugin-tooluniverse-comparative-genomics` | `836db448a230d7c1ed8a48ddfae261da630cfecd51c127d67e8d6cfda630368e` | `5def4c1804674ab1d6c4f948ae88ea7db73477a19808fcb859a4255bc48540eb` | 1 | yes | yes |
| `plugin-tooluniverse-computational-biophysics` | `e0359cc69c273099c3125193d97e2da9833e4e052892600954e3bee3ef532717` | `afaf4e8f17467ce2c8d9c6fb2c3cbf57f3142b0097128d6daeb864afc2672847` | 9 | yes | yes |
| `plugin-tooluniverse-crispr-screen-analysis` | `cbe175dc9be33fa7014b8a355ee05105c5d5f9c14c703871bf615dcc11b3dbb2` | `0731f8a9fd9027420ff179a54761c9534c35f55b56826a84a40994e8f01f33c8` | 8 | yes | yes |
| `plugin-tooluniverse-data-integration-analysis` | `fe0f0709cb828ed44d7ba96d75226423c4f2c96b40356d18702cdc0544171aeb` | `745c7fccfbba7e9824f883ae668c102c98252c8eb7c572a1b3de96cb08745ba5` | 0 | yes | yes |
| `plugin-tooluniverse-data-wrangling` | `3aaebfc6a7b01d1db295d11a8d3506b95d71d7290f2d1bae7feb93ee5a8fcc9f` | `5427932ffaa12154a3b671d21dc2f5b4a178c7a31a10f6060d3eca851903c4b3` | 1 | yes | yes |
| `plugin-tooluniverse-dataset-discovery` | `17099f032b9e45bbf51aa181d28180efbe394215800ca3df29285f8dc0d4beb7` | `fcbba3e587f3d958a022304a1156a1218b9bf558be8fd29d3ac25a4ac4a3b1e8` | 0 | yes | yes |
| `plugin-tooluniverse-diagnostic-test-evaluation` | `2a5dff3651c3a01856b36b82a78c0e6d303273a98ec060fd40c08d7bbfc78c8f` | `22ace5cb66388f6b9a14dc5b543871335fce3f58360d7f9674b1dc7ad4517ed6` | 1 | yes | yes |
| `plugin-tooluniverse-disease-research` | `891cb808eb299fdc31dfcd2544e906a80be23a5a6244fdc8ee65abb651b1b9d8` | `375dd0e0d4181b6046fb7ee483d872365d73f2c61c307968fc8db4f44edabb61` | 5 | yes | yes |
| `plugin-tooluniverse-dose-response` | `3e80a319c4a918fd655c93c623d9587d82a9876c525789228424e57e6ca5af8d` | `d52501dcf4a4b978e8584afc2e543a0437caea39057bb536926094111d2cdd03` | 1 | yes | yes |
| `plugin-tooluniverse-drug-drug-interaction` | `8c57204c0cc2d710b82d6387115fbfd63beed8e8a7c817c44c63347dbe7aca55` | `6c2eaeebc7e319d5850c20b7337f39c9f8d10c564eb3c41f58e8d20e2d613ffb` | 5 | yes | yes |
| `plugin-tooluniverse-drug-mechanism-research` | `0c7d0bc87a18cb83f67e5d71822948511291f079b9806bca998249c0c1bd8ad4` | `f9d92f24cb717ecf56b7bcb46c9ee26fbfd41ca40259d64439f2c0c307e91dbb` | 0 | yes | yes |
| `plugin-tooluniverse-drug-regulatory` | `e6f2ccd322b7796cfc8eea407a9615aebb1e837e3ca23dc6b9a9ebf6b370e773` | `6f2f22cde8b7a5ffd851dae5e702ddd094d726def0c66f8bc5dc346548a705e3` | 0 | yes | yes |
| `plugin-tooluniverse-drug-repurposing` | `e5a1023eb7258323361d48cc3747a578cc16d785a23ea7b2e71631c7db8a62d9` | `56465d644b60b4d408dcb185f6bb9258c7da849163291a7bd321b00e30b8ab72` | 5 | yes | yes |
| `plugin-tooluniverse-drug-research` | `9033d920b007fec5a029d9e515b6fadf1d731cb47be5d587c4a935f0f2d7e678` | `bb3dc8cd2cf9bff6fab4b029a2ddac05030415b2de17ef455bf4f645388fc0cb` | 5 | yes | yes |
| `plugin-tooluniverse-drug-synergy` | `ee8b70ce801bff1020446285c693154aa410e5bebaa2cf46fd78dccad2e5e526` | `0c9cc7df5968cbc87122bed07fe3080398f88e99eeee1eec98651640fd1445fc` | 1 | yes | yes |
| `plugin-tooluniverse-drug-target-validation` | `c0587ea6e49d2446adccab71e84ae8dc696bc3edb97dd7956aa9e6a7a67b6e02` | `ed177a9e79a92171c6981c4b14713bcd10417535916f5000e93319b488537fb7` | 4 | yes | yes |
| `plugin-tooluniverse-ecology-biodiversity` | `5815844a519a01d9f255d323ff0aa4e730696faf22c1e7a30b5d6cb4d278d429` | `cf3709f1a4db060746d3dd010deef7e544cb2307d6bf825747d05f8f11290177` | 0 | yes | yes |
| `plugin-tooluniverse-electron-microscopy` | `29fa5ee885e5d8aa64c1eeb5637023bc4b431de1e9869fcdbd827c6c5aaedae5` | `a097e4c6af47cec676d1ef9efd78458f39d9daf8579b676127c6904cecda08bd` | 0 | yes | yes |
| `plugin-tooluniverse-enzyme-kinetics` | `013fe642bacbf7399b16f4781850e0eade9dbbd2cda4fc24b41bef9bb262a18b` | `c084daa7b6787c8f1710e1a2d0511c16c2295522388ddf9c8ac058e32f7e24cf` | 1 | yes | yes |
| `plugin-tooluniverse-epidemiological-analysis` | `bfe0cf6bfc7c1633ce1deb1bc1f7fb9ec72ad920e36785230f6e53f4786f3a46` | `e9d30ea1201ec3dcf42dd92d61b9002bc0d77c25956973e83cd15aea711ec273` | 0 | yes | yes |
| `plugin-tooluniverse-epigenomics` | `b4a9b28f497d125ce47de008f6737412f27f327b530cd84f1d407879d75d92fd` | `f07075e3e907ca190e58837cd0cb99aca8bd017bece43572080d71137b8432ea` | 5 | yes | yes |
| `plugin-tooluniverse-epigenomics-chromatin` | `7c6b3a5d2e46e4892853980d6ee6d4eaec23a6ca0becae48e974345d97051311` | `eb6a58f276f7b2075e1a215c2a8291530c56a3badf35ca9493f98c56b4a6bd4f` | 0 | yes | yes |
| `plugin-tooluniverse-expression-data-retrieval` | `e2da490d35e51904040d58ba83a1776c52c7fcd632920fd0f913e2e4a4ff1565` | `6a4b122f0515e0e381f6044a0cb7c3da37ed32b22d2579ea36d2c7b1c8118fa1` | 2 | yes | yes |
| `plugin-tooluniverse-fastq-qc` | `23c2e0be5235cd61e172278a55b16a917a119a1bd26aec37cce8293c7d738767` | `47c0281196ca24ee4517f680f357d4da9be6a4499f679478e189f3f6eb267fe5` | 4 | yes | yes |
| `plugin-tooluniverse-functional-genomics-screens` | `6243790312db2e3555ab0734c73f7c29321433833d9e0ba63a8e00da1b725d63` | `f8ad3aa6d9598ab9316861aa7ffd6b9336e83a19f267e0a293e884e008198f9e` | 0 | yes | yes |
| `plugin-tooluniverse-gene-disease-association` | `8e1a397dd13d81fc800275a8c1a8a97d34ed91dc48b4a71dafd54b2c60021555` | `4cfbd9092648a1463a742e9d25c52cfe77990c14162e1d8480533b90634aef9b` | 0 | yes | yes |
| `plugin-tooluniverse-gene-enrichment` | `a024f75b89c7a1e937a2c74dfeb2c53e3924adfe304f2c7ff4dc343794f58dfb` | `551f6c8b36b24f8face8fd4ec8eb175d7ee9a9850b833c02cb263e94c3b72078` | 9 | yes | yes |
| `plugin-tooluniverse-gene-regulatory-networks` | `db40cb26d6f22a6b23e110a8542041ac6c0fa60fcb1b10077128dd037c21bde1` | `e399b72e6549576fe5e4bbd4e3cbce24c213259b677e533fd71bf89e9c297d25` | 0 | yes | yes |
| `plugin-tooluniverse-gpcr-structural-pharmacology` | `a16accfac36f68e7d77f24206e6c987a425ea44dcaedde2c682d8c2ce4416bbd` | `55dd4f8fed58e82f61a5057cc8e9f45a1906d14d5a2ce10936ca78a7accc3447` | 0 | yes | yes |
| `plugin-tooluniverse-gwas-drug-discovery` | `93b5f7b88a45ae57f4167d82f1249e022238db39edb5cd15568a577e74e8f9ae` | `cca15898a2ec2ce91ddaf494c32bee92f441d3ae3bf6fb9b08b6799b8ab9bf05` | 6 | yes | yes |
| `plugin-tooluniverse-gwas-finemapping` | `1bad032daeb36a8a54734dbb2b91b22798078d9d476bc3c26b0c27b4be1182b3` | `7ec4e9c82cb04e95b8aafc37e14fcc976e9d6d976a6510b07f5fc5caaee794b2` | 1 | yes | yes |
| `plugin-tooluniverse-gwas-snp-interpretation` | `75a2fbac8fa59dbca0a12e808e624db325bdd6a3d7d74137dd893f5c6fc0c2d4` | `70a520a13bbe39bced64c816124f1e34b35669dc1efa34803d84e20d0bbd6b5d` | 2 | yes | yes |
| `plugin-tooluniverse-gwas-study-explorer` | `aa6c7a69c16ba92e9fa8e5fb983d3a21fda84489d18da909586c7ff8b82f1e5d` | `14e7a76359ca4368fd5816a2b3dfd0418499e8549a5afc1e69f14ebb97c63a8f` | 1 | yes | yes |
| `plugin-tooluniverse-gwas-trait-to-gene` | `549cdae798eaac933225db8289588c85f5bd8c8ccdc654d2a435c51d30224f4f` | `71058cdd0094a1def3b34ddab790f8a90c5bf0fef77f5bfde938a1364d05b54d` | 1 | yes | yes |
| `plugin-tooluniverse-hla-immunogenomics` | `ff83059dd724386808700750aa50a58cb77d4f3e7591c14799637f12154418cd` | `ece907d4cfe071d9e5f5bcfec8b59af297cb5e1e98f31b60b38f03fe5ba0ad98` | 0 | yes | yes |
| `plugin-tooluniverse-image-analysis` | `7c86bc77bd1eb4a4ea009843d5b4ea6a5324897e2255c095c4edbc4a08fb5499` | `47455bfd9c59ecb486cff4114ccc4078a6c728b9282068375177cafb4c823daa` | 9 | yes | yes |
| `plugin-tooluniverse-immune-repertoire-analysis` | `c53dafb795dfb2ab4d4b794dade4d2854fd34d5fc4e427660d8cbf52de20bc04` | `95d4067b25c4fd02634df85c5909a3f36d943c7df7dea4baf5974e12e6024550` | 2 | yes | yes |
| `plugin-tooluniverse-immunology` | `051f7dcbb0a30e01f9609d60953f363c5002e67bd2db5f4d0bda43aecb154b97` | `df97b898f46c6877d1cc48f8baa7cd14e04945a51c864e4b13ddfb71f3f9059f` | 0 | yes | yes |
| `plugin-tooluniverse-immunotherapy-response-prediction` | `464ac497c97399f2c0097a7c8e56e6d96ef50d5af11acd55953f64257d1faf56` | `61435771561ec803d23655bf983219110406112f97765a6ae048b2e06b6a7942` | 5 | yes | yes |
| `plugin-tooluniverse-infectious-disease` | `62ca225a3f4e49d4869bb6ad66700e4dfa2776d133f3ecf41ac9b9b6e87df709` | `3f185d4fac3dec7665767d11fb34708c59bae38e2aa66577cb5d8701b6082840` | 5 | yes | yes |
| `plugin-tooluniverse-inorganic-physical-chemistry` | `e506d56ce473aa28c26ed7862dd88e20dcf0f6f7332a519de9b009394e2c6f5d` | `0ee151f15158e627ddae4ab4279f0a3dad0c9f2142f020aa7195c6ee3a4580cc` | 1 | yes | yes |
| `plugin-tooluniverse-kegg-disease-drug` | `62f37d390f738658c4511c292fd0be8ff09a062ab8904f1cea646ea9893fca4a` | `13899987567186d57f795b44e1ca00bc23805e82cf5ed40dc3dc16ff15034802` | 0 | yes | yes |
| `plugin-tooluniverse-lipidomics` | `2e9fee7ef1119fa7e1f1bcc146b7726366713687721e51e158d1a2c9386f0160` | `08fb3bfe67e4e87890df7b6642412f32731bca9a65123fe54af38d8743aa5635` | 0 | yes | yes |
| `plugin-tooluniverse-literature-deep-research` | `4bea10bec1de611c2d61c62fe16aefa3e63611259f9114137c88ed6b83f0d6f9` | `2d626c0d1ed7c9738f8eb3db290ebab79f75538f50045b7f8d49df8ec47a940a` | 6 | yes | yes |
| `plugin-tooluniverse-mendelian-randomization` | `59d341c903972e3a38212b20802838bd25d4c70f9877a384960afb23eb4b4bde` | `2461861006e45c97cbc8d65a53e9d5b4d9657ad063a12c128ba7ecd16d8f4006` | 0 | yes | yes |
| `plugin-tooluniverse-meta-analysis` | `3409331e3763883cbb937c62db79788c90765227a276e0191b73c2d918993489` | `4fbb11b14cfa934aa9137ae1a75288544f43b52b6236cf9bb7b52403804cd656` | 1 | yes | yes |
| `plugin-tooluniverse-metabolomics` | `814371d496e4599a854a06a04356e77af995ade01e86ae128c1012d5c90fb825` | `4f1c1b8b8e00e81a331c357b5ce06feaa6c8b8e1126d18733b7e6085c610f50e` | 11 | yes | yes |
| `plugin-tooluniverse-metabolomics-analysis` | `bb7800e936aa1a6a496f92fe6dc07d654cc2a8920560291336cc2671ccd7e2a0` | `751ffc9ac26be71cf247c8e8c11c436168fbfa849b58af5306c6596ed3edf7cf` | 2 | yes | yes |
| `plugin-tooluniverse-metabolomics-pathway` | `44dd06b60c98fdfcfa6f18dced519e678ff79c25eb0866022513cd1f3806dfca` | `b67578975fe1af3a4f4bebc6d25aa893178090454df8435f0f98bb1e59de4f03` | 0 | yes | yes |
| `plugin-tooluniverse-metagenomics-analysis` | `76c566c54a64fab44f83d0a6d0faa884ceea33e591e647872b79039bfeca3fd2` | `12d1c32a43a19d56601c9e514ba08d510175cb4a791528d775ef60ed201331f0` | 0 | yes | yes |
| `plugin-tooluniverse-microbial-genome-characterization` | `6d2330048d27ed746958717738275cda41d8a0f3f1aa7d004b47a7715d3ad03f` | `295e9bf17dceab619d16eb3827b2c3c2c277cb7b100958dcaadc7dfe60b11da1` | 0 | yes | yes |
| `plugin-tooluniverse-microbiome-research` | `c14b5d3d85006b32897b6ec8ad894caa177b2dcf69885d3d48a7898528574585` | `9803bdb453f12924292f89870fcc9151c0c22cfb533bb75fb05ea3af955701fc` | 0 | yes | yes |
| `plugin-tooluniverse-model-organism-genetics` | `772cc862babfd97f4e7168cb36dead72d94c709f8b0c368e7b068fe0d8f08f80` | `befdbef8cf527988c2a6f2ea28eecef263cfd7d857b3305443dd387708d74b25` | 0 | yes | yes |
| `plugin-tooluniverse-molecular-cloning` | `3adc85140fe380f1ca661eb97d065c241798adee64ccbda79a88ed47c6ead8ec` | `964abb6eac594f226de4958790f394ba98fd9eb2f3858e554869281950a50fbb` | 1 | yes | yes |
| `plugin-tooluniverse-multi-omics-integration` | `a55ecc49b719a8fbb0d27d6e942c03a62ea4f0531fc70045712b2177c3a350d2` | `358f309a31afe835e4b13dc9a9d971d6c101d41f620d64e91af5cb7ac9713d46` | 1 | yes | yes |
| `plugin-tooluniverse-multiomic-disease-characterization` | `514dc1fd75f84bb40fdc877fb6c799a1d6503c06355f00c280d4fab9994b10f5` | `36bf61aad7eb1d9491514dfbf215c0f858455fa5398c72dfb308a38ce40168ef` | 5 | yes | yes |
| `plugin-tooluniverse-natural-product-dereplication` | `710c41d94dbf9fd746c7eb9a5d2e29403e14eedcfbbdbf199c368dec090d733b` | `c1e97e184be127054b3a84849964af4b92fb87e7909eacbfee5a0d5daea0f003` | 0 | yes | yes |
| `plugin-tooluniverse-network-pharmacology` | `e25fb72c506b826b33d31a9f0864e7fa8207d90a4ab5abf3faa130355d2b61f8` | `5b290bc8dd4255eca4644a2a7e64e93564fe7fef0c7bb0cb06d572111d39a4c5` | 7 | yes | yes |
| `plugin-tooluniverse-neuroscience` | `ea0f5e4aeb9d780735f64ef37b3c29f6931c3701c16065dbb179e6ccdc1b6914` | `5572ed790cf5bf8e25218e0e28818a797cd579945bd47be31ec3d79ff2914728` | 0 | yes | yes |
| `plugin-tooluniverse-noncoding-rna` | `d664e87c09c347a14b3dd58c4c6eadd11065a015a1ba065b9bef96546c18dc89` | `c457d97a9d0e924ce6037cdc6727d45b2e0b33aea0aee8a9c6787de4ad49a162` | 0 | yes | yes |
| `plugin-tooluniverse-organic-chemistry` | `421d8d4c36249ba544047f26a3839ce466ef445035e37e25c884d50ecae0b096` | `3dc51cc5f3691d89d609f14f44dd64f2640400eafb89be491cebcd6f43366b0e` | 7 | yes | yes |
| `plugin-tooluniverse-pathway-disease-genetics` | `22f9e157395101ee3f71b47c7e0c9d4fdbb7dff617484d6a3dc1c4bb3aa994fc` | `a5ebff1cd7a715df9f71fcf55f900e4f2f860d1e9a656112ed0d0921f7abd5fb` | 0 | yes | yes |
| `plugin-tooluniverse-peptide-target-deorphanization` | `126c3c82d90179eb503370c9f58c8f3580f5ba39870caacf7c55a7b49ff8ce02` | `0185888f341904b45cd12a7163b78bed5031c6494ede811ac64c8729619ca307` | 3 | yes | yes |
| `plugin-tooluniverse-pharmacogenomics` | `52f73f1d5195f3b57960ffdb72a55a4823b44f810c5f91abaf4f84815bed5aa7` | `78ce1c7b90df3f76172f862e51bef6a9e640dbc3a8c1cec601e525c63d944aa2` | 0 | yes | yes |
| `plugin-tooluniverse-pharmacokinetics` | `fe98f074e965814a1ac38a3eff4e94f8fc3c200b6056318e1030bf9eb0a7d398` | `a3fde7e72fe9f03e7f9a507abfa049c4b897a9004ba7cdc0139e5ca570c5b43a` | 1 | yes | yes |
| `plugin-tooluniverse-pharmacovigilance` | `40c5aa26ebacd566bb6cb6113560145b0bd091eeb16a42af9de7ee4ef8cf1f5e` | `115a6177465447fdb2b864b99432a6dc9055c351bf2b006782a0bc05f70ce22d` | 6 | yes | yes |
| `plugin-tooluniverse-phewas` | `05ee70792fdf72d4da39a0930c1155285e8cfa427761b26836dc288e537a884a` | `8c6b41cd158afe25cc731afe643397ffe9a9f4e5284a1bc690736d42a4f57809` | 0 | yes | yes |
| `plugin-tooluniverse-phylogenetics` | `7ae8282ffe24a9a54eaa824d44a6f0116144bd8a99a47dc0ed57785e72e78fa4` | `8561268c3bae30bad22ef403d8d2fb3efce8a21fd9aa1dee038d340d32c23860` | 12 | yes | yes |
| `plugin-tooluniverse-plant-genomics` | `00105a68ff6805db910ea044a1fac20991c344930df12a638dec3c6dcb709a56` | `acdceb480f49c9babfd4a97d1b147ca1bcef05b2df316cbc2b9097b28fbdb421` | 0 | yes | yes |
| `plugin-tooluniverse-polygenic-risk-score` | `635226a2dab4cd8b90d83c3678f867ac2c77622be3cf82ca3954199a5354a670` | `44d7c272c330c220981fc6794f90b9f94f7f3bbc73e2f9c2e0145ef53bc3d181` | 2 | yes | yes |
| `plugin-tooluniverse-population-genetics` | `a51b8b82cf208a1367233e6abb867bc7863cc9320adf1eb71ee3f679417caa5c` | `5e1c41dfbe8eb1f889b77396c0db6dd11887f82570139a0126e4e13ac224cc2e` | 1 | yes | yes |
| `plugin-tooluniverse-population-genetics-1000genomes` | `8f209e1a0e3d240e312ea87ed38b700536b5b620e457b21b4224ea8c52f13743` | `b141ae118d0eac0a2b2f0781dcb3cae8b5c6a9cfa2054abb54d57f6fb85a0aaa` | 0 | yes | yes |
| `plugin-tooluniverse-precision-medicine-stratification` | `4abe4bfb9d079f85f030381357d3854d8746ffb6f6179c4e82f99bd089d11fc7` | `7fa38d030a054fc8bf79d40fe6724bc974b03e440d8fe4eb05964e5f603f95a1` | 5 | yes | yes |
| `plugin-tooluniverse-precision-oncology` | `81116a525709cd0b20a97e6c8582789f0e8dc4a8dfb4615aea03c5be0739129e` | `4514b4586b18a58e8a088d72f501b91f24154d85130920fa980d21ae16ca0572` | 7 | yes | yes |
| `plugin-tooluniverse-primer-design` | `117431da8aa422108846e4d5d4aba961a12a3c14181846d095854df5964bb19a` | `d6931e13afb6e8b75e9cf2a8803e3a8a7e7b228bf623e6fb290ed10db4cb5819` | 1 | yes | yes |
| `plugin-tooluniverse-product-safety-surveillance` | `362167b3a098644d6c75d53feccaca57b158a3db0f6601c162f05a845d62d2ef` | `ca080a6b81908b6c2c311ae740acde030a90aa81a07560db112f30eae75deafa` | 1 | yes | yes |
| `plugin-tooluniverse-protein-interactions` | `adca4fabae97cb8e690b9abb63e352d23364b1c4dc563fb3d45833d4aa8f287e` | `5eb5f3774446dc5f9ec0b7bada219e020a7e94d1a48d8c17a918a9ada5eacbf3` | 6 | yes | yes |
| `plugin-tooluniverse-protein-lof-mechanism` | `1bb612724c355a74d7ddafe5c0f67c025ec54c304917a33fadb470d28606ae8e` | `1f615d4b44b8261789093d0bd26f635c1c3fcb116254e8d61e13da85a9cdde1f` | 0 | yes | yes |
| `plugin-tooluniverse-protein-modification-analysis` | `5b8a6a914b3af25169b6a2afbec0ad03b7187c09db7622a91ffa7335d8106318` | `c94ce710e206f69409bf4d06ef33b0a9d445945c00309d64a1d72b9dc394bdc7` | 0 | yes | yes |
| `plugin-tooluniverse-protein-sae-variant-interpretation` | `94169ba5d9455e0bde83bfa7a3c68b054123a4b39865bad34a535e463e505fa9` | `9dd5952af0fd440e1b85eb37b257616efec12a9891f49abd7828f2d2f1e4d605` | 0 | yes | yes |
| `plugin-tooluniverse-protein-structural-annotation-pdb` | `8337cf1907f36c313d929e15f95df8c8622c755c097584f1af92ef20089497b8` | `f6d46b45049ec8de00f8c2291ccc601ccba697d2d22b1ea45368ecaaf566eec3` | 0 | yes | yes |
| `plugin-tooluniverse-protein-structure-prediction` | `69e975f0f089d1064e6e2886bd9d422343e178cf37901e17d299a51f00f0b733` | `c3cea2a40bc63d353fa8766b3415f1d7d8cae594a2f938dcf7d7230e82d95b5c` | 0 | yes | yes |
| `plugin-tooluniverse-protein-structure-retrieval` | `6ca5e8213fe48c35b1c8912e4709f30a83d68bc51f001a3b9457c84095bbe77e` | `d69571429be7b9d909e9a5b9f78b401c03ab55b6021a330397d6a5acdd1daecf` | 2 | yes | yes |
| `plugin-tooluniverse-protein-therapeutic-design` | `f4aa3988676d2742fc8f8db61017ddf583a5f6fc1910aca53c9340c9d5994c4d` | `a3acd084cdb8171f7d34d917a891ce43d43c6a24854d8f2aae334f694abf9788` | 5 | yes | yes |
| `plugin-tooluniverse-proteomics-analysis` | `c34e1dfaf882d1f5c8f2b1fc7f7e69e58f42e3a476b8f26db1b2bad29c92edf3` | `d66489b3519bfa252509cea833fc85f0b5f722b0122645d94d6511f4f76d4c42` | 3 | yes | yes |
| `plugin-tooluniverse-proteomics-data-retrieval` | `3edbb397c3e743fe96fb77f3ce21d93c88f1905ebe3dc412cb386646e342c1fb` | `23c6059d494edb1a80570ccfd07452373f17e4c841fb628d6e00ec15e3d28c72` | 0 | yes | yes |
| `plugin-tooluniverse-rare-disease-diagnosis` | `85ab897047e9cdfc5f41818ca1907b3413625ab1fac4720d9e6d47cd3480a80f` | `554838f0e320980aa3f9786a9fce1646aba363b1794f485c1210126284910120` | 6 | yes | yes |
| `plugin-tooluniverse-rare-disease-genomics` | `09d1a44ce84dcc7dbbe5f564411bcb4ab38b9c93bf070cce3d77278db014728a` | `6ee4139fe3a8fe9deea449136dd5053eed63ed1d7ee078f4b8e711fc4f3bdca8` | 0 | yes | yes |
| `plugin-tooluniverse-regulatory-genomics` | `2751b9de652612d62746c6925ba288fae37526f12af424b3137af88f7ba06b63` | `2948137e251e547fd266f097e0f1fd774c244d722e875c5176ee26d33fab3e0e` | 0 | yes | yes |
| `plugin-tooluniverse-regulatory-variant-analysis` | `0ab93c9372727a3aa9eff3966226481394e3a2771c6ad49643a5d4ff0021ce7a` | `5085e08a1dfbcd0fa4e5ab477a02619794c6112b58adfee22c97de7743c36f26` | 0 | yes | yes |
| `plugin-tooluniverse-residue-functional-mechanism-interpretation` | `a5d3c75ae8e94da230cff94270c590bb2a584307ec5be403c3c304a793f10c6b` | `bf4926da8eb0d2bf073e756d4eb65771d2166bae2b954559593d20751d665520` | 1 | yes | yes |
| `plugin-tooluniverse-rnaseq-deseq2` | `7e8e6c74351445674a77c5919280cc67393762d97a1cbdd772dcbb06d8a8ae83` | `f407764985ea677d19559582566067210bc6dbc934843a6c60f6d79521def567` | 20 | yes | yes |
| `plugin-tooluniverse-sequence-analysis` | `418de0b7dfdf2bd73947842989c0039ddd8f86e22ce46e68394c7d32786f954a` | `5dbb013c68adadee25cc23dde61d6b7fb530b043bf124bcd3639e20ed30fffc6` | 4 | yes | yes |
| `plugin-tooluniverse-sequence-retrieval` | `199244d2eecac9f81ed71ccbe6cd93a03d749f7b9e2dc31da04587c5f130a7cb` | `109db966f9aee0a16c2ff5479f1b0365b75061a2407ae99dd522015f3f300d3f` | 2 | yes | yes |
| `plugin-tooluniverse-single-cell` | `cc0d6ec4a9d3c4fc18fa34ba2381df6d9418fc65b5ece34b054e9ef1588cc251` | `9347f4e6555e75df2b30837d5a85b53b1161f969fb7c0b38a3904f4263dc0836` | 13 | yes | yes |
| `plugin-tooluniverse-small-molecule-discovery` | `72f26f8c37bf590ddc05a0dd3c77dd915905121c202a815105a0a5b8649e745c` | `58f1dfd741a6ff6d9a1aefb11d6c7661c4aed7667fa722d6146450d70437defe` | 0 | yes | yes |
| `plugin-tooluniverse-spatial-omics-analysis` | `ed8c29e134f08db0752901fcd90f8fe746d3d5aadfb8871f29e5c055200cdb0b` | `5ea136c1b3dd4fd1e2acb0f736dc8b578f943761e35320f02edf455f7961860d` | 4 | yes | yes |
| `plugin-tooluniverse-spatial-transcriptomics` | `2250b133db6b59daf74a484f67b1d24eaf6df1510f6d55f8763129aa7d25213c` | `19ddc28d043c518b7b977852f7fd62b24d358ba9a3d262fe81289ea876f5754c` | 2 | yes | yes |
| `plugin-tooluniverse-statistical-modeling` | `863ce5a2819885b6d7b3e4bb3ea455d53bbbad5e39c24592ebc5288b58c7af66` | `ff3f9a8e1edc0f82e224e2b59c3a5f877de9709c36460bc22b3904a0d0fc51b0` | 21 | yes | yes |
| `plugin-tooluniverse-stem-cell-organoid` | `3b3a9e07b920fa61101cab76deab6ce5d9bfe20fc8760a65399150ba2f390fe5` | `30da1abb5b80c774aa6a7d174b9cc6b4a3988f6bb2a3da0d581fd9aff9b5bd27` | 0 | yes | yes |
| `plugin-tooluniverse-structural-proteomics` | `ca748ff9663c619ab75d92bf667a185c17863bc6873841e09d2e3f7394fdf07c` | `19c0173af654b12e26bfe6443d7c168026fcf70ed5f4d6271da264a6539f3391` | 0 | yes | yes |
| `plugin-tooluniverse-structural-variant-analysis` | `aa54a3c6734a199166a6166fb8a5209798caf5d1d966dd3c9a2ef7c58330a766` | `f8c573ee46084f0682523b6a4a0a54581d519505d795275875654b85e412b7f7` | 4 | yes | yes |
| `plugin-tooluniverse-systems-biology` | `1f233b027a7ee8681cae7946efc50fc72a7540afb224c3e9d00dbac103acb44f` | `a9690dbf3f197865a414d2ba13e728aecd42e2e6f9cfd2cc601d13081f6076a0` | 5 | yes | yes |
| `plugin-tooluniverse-target-research` | `0eb1dcdcd6bd43cc269c561d63330b740b43c9f4881871e86abda9ddf97ba6bd` | `d065a63ca8fc6200b03681298581f0ded9583cf39dc37f6475b71de8fa29b9ac` | 5 | yes | yes |
| `plugin-tooluniverse-toxicology` | `f075c4bc20b25e9e3de2cf20593c90357a6d23160e28cfb90097b390828b53a0` | `f124f3fb0772eaf3152fba3ab21950ccd2277a0a72ad4a4bcf136609d832e5b7` | 0 | yes | yes |
| `plugin-tooluniverse-vaccine-design` | `facca20e1ee0bb2ccf7e13d720a712ba33ddb21ad0bf276f18b18e059e7342cf` | `615477f940158241547bbde6318593c637856d500c4fa980e22b19b060b39337` | 1 | yes | yes |
| `plugin-tooluniverse-variant-analysis` | `b56c3d08d672777f50cc5c93ec84e4d9dce5e2e19a21c09b09a09f869a7a65e7` | `156f48f7c57f8cc4af73290fa6f686820263cbc3e7fcc023781ab5a5d879067f` | 13 | yes | yes |
| `plugin-tooluniverse-variant-functional-annotation` | `e1cdc42c02af55537450180ce2c9698a0b2b0d89092ce72a012ce85f644cf48a` | `205e2f8ef6e2a3b98150875c0132b13bd4f3b98be4a75bf49efadb80d87dc81a` | 0 | yes | yes |
| `plugin-tooluniverse-variant-interpretation` | `4326fed2b05c6dcdacac4d70bbb72f13397a3446abc6032a3a86f2df11b350af` | `456a72fbef19327e5b4df8abd09cdff40dddf3b8131290d6efe5cdc4240d9aa4` | 5 | yes | yes |
| `plugin-tooluniverse-variant-predictor-dms-validation` | `516cf32f100af2dd0bbe2b2753f08a165d46f8039942050a51bef5fe1e4acb3b` | `e80de8bdc7aede90a595d502921f5d4d6159a4b4a133d463322a62fbbf104a00` | 0 | yes | yes |
| `plugin-tooluniverse-variant-to-mechanism` | `2794fe2e7142c1a4321bef62a5a40ea6be7ed46b49e8e7447438188d43dfde5d` | `ad02849d269ccd9426860e43247524568f688cb9bcd8b3805e9246e9a904e17d` | 0 | yes | yes |

## Machine Review Artifact

| artifact | path | sha256 |
|---|---|---|
| extension review | `audits/tooluniverse/v1.3.1/artifacts/extension-review.json` | `2506ae52a2daf5b6126871b7382ec134a2b5d175b78fd74b8a95f19136b34226` |

## Human Confirmation

- [x] 130 个上游语义义务均由 extension SKILL 或 graph profile 承接。
- [x] extension SKILL 不含 next-node / next-phase / agent-team orchestration。
- [x] 命名、registry、审计记录、锚点 manifest 身份一致。
- [x] Agent 语义审阅见 `05-semantic-review.md`。
