# ToolUniverse Extension Anchor Review — v1.5.4

## Registry And Domain Review

- capability entries: 130
- profile entries: 130
- ToolUniverse 领域分配由 `src/plugins/domain-catalog.json` 自动镜像
- 每个领域只包含其 reviewed raw Skills 对应 extension
- extension capability IDs 与 raw Skill IDs 不冲突；与 bundled capabilities 不冲突。

## Package Review

| capability_id | package tree SHA-256 | profile SHA-256 | tool files | tools byte-identical | required fields bound |
|---|---|---|---|---|---|
| `plugin-tooluniverse-acmg-variant-classification` | `eaabb8613d1b9d7f10316e2d66fcb2e851968bf7fac27265965208f9dc1628ee` | `9cb2cf5f00ecf224cf7eb5c27856a04f76eb13adb5c91c927e4a5f7062396c2b` | 0 | yes | yes |
| `plugin-tooluniverse-admet-prediction` | `60005ad63c56e3d38cdfa76ffe9aab4b0bc96bc98f318a7d28c4b9941754794a` | `478b4a4f591c35df33d11b5dff922d9b944966ba333573a475159a8f57d02fb0` | 0 | yes | yes |
| `plugin-tooluniverse-adverse-event-detection` | `b0a34bf540acedc224333742d4091e9c520a9c3f2260a49ee0708c0b0af03bef` | `d651e8280ced640469701c4a239e9d70d426162d991f850b009535099e1ed7e0` | 4 | yes | yes |
| `plugin-tooluniverse-adverse-outcome-pathway` | `8a1c3c222213aafd734cfd63e66a4c16cc30ecf134437982041ba3228e8dcfed` | `a1e22a251693c28e7e366e512aea2ae888c0c5823e31d0b4626dff0e70fa7502` | 0 | yes | yes |
| `plugin-tooluniverse-aging-senescence` | `ee45bd976de5b4f671a630af61a5f6389a938403f200fc296ec44b7a8035f959` | `686ed247ff738d79ae6802763cecdb6048d72e6cdec577fcac2f1c4032959cd8` | 0 | yes | yes |
| `plugin-tooluniverse-antibody-engineering` | `32a190a1e5786b5445291e9f23ae28aec0df58161d4c869cfc3ada03665cee81` | `51a68a5dae94e63e9bd7b18c877d3e7393cf0762bedd6cf71ca091f026e32ec8` | 7 | yes | yes |
| `plugin-tooluniverse-binder-discovery` | `8c8a66de4934c4565ee26d8e7914796dab390b447bec763357d8e004af06da33` | `006b1ccfcc1275d2d75459ca40ed15a394dac57dea067e1241744b9e5d2c8c46` | 5 | yes | yes |
| `plugin-tooluniverse-cancer-classification` | `e2a505f4798045b6a3b77c05d88010771d0663b13c3c2b6b1b7c52ea4c22f3d2` | `5f73232d7319b1db95b048dc0fc40b9e2c996e438fc6d0ca4ca7e8ab29d922dc` | 0 | yes | yes |
| `plugin-tooluniverse-cancer-genomics-tcga` | `c549a658ef9b6b4039fb0da72cddf78cc2fcec95d85eb9989d89823439bcdd14` | `93252bb130f247228f2b2518869bb4748b79015f316bfc1d4e89c9203901bd49` | 0 | yes | yes |
| `plugin-tooluniverse-cancer-variant-interpretation` | `f60ebb506633c3ba098713c9da5a3bfcc7e2e3b4e576184b42d56f5c3f2b9a50` | `68bf82499204b30be0c825e6afabce3e4d6f0bda7db7f16d67a69c038f22823e` | 7 | yes | yes |
| `plugin-tooluniverse-cell-line-profiling` | `cd33d0551f4cb69ff563942db67cc8e5073576a39fd8b4cec564fe90763b4976` | `c9ecf59fdd873b2d68deb8987122ebebf7d4b6d0b75fb74b714c845a0d4c965c` | 1 | yes | yes |
| `plugin-tooluniverse-chemical-compound-retrieval` | `efcbc0b7c74dba3a5b40d11bdd3aab3c7cafbc1b63e9e6ef9248eca01c21c639` | `1e656fc2fe845ba6c14163427a74f0dcf4645299e017ca3dc1048f1317c1e7de` | 2 | yes | yes |
| `plugin-tooluniverse-chemical-safety` | `b5eea622747cd40fe5152266904b49ff75afe7bc3a5c472063dcb10fc6a2e405` | `fe9c96821d68e75b07b656a0de7452515203595edffd39b048f626eb69cfe95d` | 4 | yes | yes |
| `plugin-tooluniverse-chemical-sourcing` | `4d0395a756704720eab82a7efe6987fd9df73ed9a6e3476bd5d5dd33723f9e46` | `dd26161461a2bf461fb60aa2b3017b19cc18d83d6caac42c74998821fac88f94` | 0 | yes | yes |
| `plugin-tooluniverse-clinical-data-integration` | `27705fc6544ef2037f25b54e1e29a34a579026952c70f7761b0c99361c93cd82` | `6ebaa61af6fa8c6cbce7346f48d138c20647e45e16e7230b9f8a2f7e96767e06` | 0 | yes | yes |
| `plugin-tooluniverse-clinical-guidelines` | `7faa325f4b9fa7734b04356d9bc37ce1e816e74c0647dad28a6aa77811f254c8` | `ed62ae9356ec4a52e5a2150badc31b52df99719a89db8e7d65675c552019dfaf` | 1 | yes | yes |
| `plugin-tooluniverse-clinical-risk-scoring` | `3d04e0587d378fcafcf5f671b6a1e7c12140f4d131d7853a2dc498e959fc81ce` | `08436ef620d2b0ea0cfed0798b5d5c44c4d841eef56f67f8f33a5fb7d1c74781` | 0 | yes | yes |
| `plugin-tooluniverse-clinical-trial-design` | `604c401b81d32c35cda4b0db8eec405cd583dc7e50f94892e13f723a46975993` | `d183445e60121350dae3ce0484985216c2ca72ac6594932b5c4fc4a40859078a` | 8 | yes | yes |
| `plugin-tooluniverse-clinical-trial-matching` | `9ef53ddd1062e16c0521143e7cd2804c73b39fa63316880078fcd3c777cbf5bc` | `df1716dc46465ac91d9ab674c73426532fd4620afb5a289566e045ccfa6c4647` | 7 | yes | yes |
| `plugin-tooluniverse-comparative-genomics` | `40585449a1338b07b6fbb5fe423e598c347626a058cef2dcacd904faaab61659` | `5def4c1804674ab1d6c4f948ae88ea7db73477a19808fcb859a4255bc48540eb` | 1 | yes | yes |
| `plugin-tooluniverse-computational-biophysics` | `af9ac06bcf943dd87628e3c6b0fbfcf2e4d0eb1d427e27e4cfcb48ab2c47ef90` | `afaf4e8f17467ce2c8d9c6fb2c3cbf57f3142b0097128d6daeb864afc2672847` | 9 | yes | yes |
| `plugin-tooluniverse-crispr-screen-analysis` | `70d938e6f3d46c59c09037d456c2c84c7c29953d37f5d30787bd8a9cd25583ff` | `0731f8a9fd9027420ff179a54761c9534c35f55b56826a84a40994e8f01f33c8` | 8 | yes | yes |
| `plugin-tooluniverse-data-integration-analysis` | `309570a6dcf8cf4e95ee7f10f73e50df9fa6194e868bd5e3e3179862621c80b6` | `745c7fccfbba7e9824f883ae668c102c98252c8eb7c572a1b3de96cb08745ba5` | 0 | yes | yes |
| `plugin-tooluniverse-data-wrangling` | `f85c057f2e0e47d54b1c17b3ee501077918dc55ba1d967b188647f2d2f8cf40f` | `5427932ffaa12154a3b671d21dc2f5b4a178c7a31a10f6060d3eca851903c4b3` | 1 | yes | yes |
| `plugin-tooluniverse-dataset-discovery` | `09dee67bdf875e5f4fe60579b6b793517055a13a256af953db95208a55a1adce` | `fcbba3e587f3d958a022304a1156a1218b9bf558be8fd29d3ac25a4ac4a3b1e8` | 0 | yes | yes |
| `plugin-tooluniverse-diagnostic-test-evaluation` | `4024d8ac4db9c8ee3a79248941d26dd65dcd55cb18e75edab4e9b0d578615c0d` | `22ace5cb66388f6b9a14dc5b543871335fce3f58360d7f9674b1dc7ad4517ed6` | 1 | yes | yes |
| `plugin-tooluniverse-disease-research` | `b4cbff25ff797467d7e8193bea5b95845855758f35d7fca93717fe108b581653` | `375dd0e0d4181b6046fb7ee483d872365d73f2c61c307968fc8db4f44edabb61` | 5 | yes | yes |
| `plugin-tooluniverse-dose-response` | `212fdbf647651edf033b9bc6c1cce8b3c586f604dea2c875c9523d20310f837b` | `d52501dcf4a4b978e8584afc2e543a0437caea39057bb536926094111d2cdd03` | 1 | yes | yes |
| `plugin-tooluniverse-drug-drug-interaction` | `f8c4525571883f28a43251fa16cec2b5a5e92156c240332b377d533cc72bc4f4` | `6c2eaeebc7e319d5850c20b7337f39c9f8d10c564eb3c41f58e8d20e2d613ffb` | 5 | yes | yes |
| `plugin-tooluniverse-drug-mechanism-research` | `0d2e77e3b8ea37b6e78aaa65b40b544238552d311c86351ae79ae008da97258a` | `f9d92f24cb717ecf56b7bcb46c9ee26fbfd41ca40259d64439f2c0c307e91dbb` | 0 | yes | yes |
| `plugin-tooluniverse-drug-regulatory` | `e302b6867d95ec93ebe50729ae5bcb2176319077b305b3362b911d1968dd4b5d` | `6f2f22cde8b7a5ffd851dae5e702ddd094d726def0c66f8bc5dc346548a705e3` | 0 | yes | yes |
| `plugin-tooluniverse-drug-repurposing` | `dadc3d3d3ecf264b63dddd03c978de66ab6d4af2144ad3c5438783a35c4764ae` | `56465d644b60b4d408dcb185f6bb9258c7da849163291a7bd321b00e30b8ab72` | 5 | yes | yes |
| `plugin-tooluniverse-drug-research` | `e2f892497accd46c00f0e3f2a725e2e2f20d99458984326241054b58c0e68e1c` | `bb3dc8cd2cf9bff6fab4b029a2ddac05030415b2de17ef455bf4f645388fc0cb` | 5 | yes | yes |
| `plugin-tooluniverse-drug-synergy` | `1ea96cee1e95ca9248bd19af6455f041806129f81b7bc2ee173c58a29b2aec16` | `0c9cc7df5968cbc87122bed07fe3080398f88e99eeee1eec98651640fd1445fc` | 1 | yes | yes |
| `plugin-tooluniverse-drug-target-validation` | `3860c33197762a4469a6dbf0290a20d4c88bce46fe51caa01bccb05252bd0601` | `ed177a9e79a92171c6981c4b14713bcd10417535916f5000e93319b488537fb7` | 4 | yes | yes |
| `plugin-tooluniverse-ecology-biodiversity` | `312dbe5d10c8604a1ff6c4a4973529f01b6d2ad69e0b10de762226673ab0fae0` | `cf3709f1a4db060746d3dd010deef7e544cb2307d6bf825747d05f8f11290177` | 0 | yes | yes |
| `plugin-tooluniverse-electron-microscopy` | `3307823c78d9cdba383a00799f68e631af93a1823e6e0eb679ad033291ec2d70` | `a097e4c6af47cec676d1ef9efd78458f39d9daf8579b676127c6904cecda08bd` | 0 | yes | yes |
| `plugin-tooluniverse-enzyme-kinetics` | `603a5ff0cf2a81bb7343e048c894be52a9f5f46464b0b8f557c40826758d5b5f` | `c084daa7b6787c8f1710e1a2d0511c16c2295522388ddf9c8ac058e32f7e24cf` | 1 | yes | yes |
| `plugin-tooluniverse-epidemiological-analysis` | `2d031ee2e0a45dd138c654e69b1f32fa0a6c463fdb860b35efa3f1d1be0e23c8` | `e9d30ea1201ec3dcf42dd92d61b9002bc0d77c25956973e83cd15aea711ec273` | 0 | yes | yes |
| `plugin-tooluniverse-epigenomics` | `c4aab0e17634e7b767e17d34e1d3666e782fc089fa42cbd4071ef9e642da1189` | `f07075e3e907ca190e58837cd0cb99aca8bd017bece43572080d71137b8432ea` | 5 | yes | yes |
| `plugin-tooluniverse-epigenomics-chromatin` | `7b92676bc080cde0318eb19fdfaf0a1fff50f4b894278c2f182e2923e44483a7` | `eb6a58f276f7b2075e1a215c2a8291530c56a3badf35ca9493f98c56b4a6bd4f` | 0 | yes | yes |
| `plugin-tooluniverse-expression-data-retrieval` | `8c9ab02cdb17518f00d81e8ee8e5c60ff2546ac46dbdb0712140af0406135fc9` | `6a4b122f0515e0e381f6044a0cb7c3da37ed32b22d2579ea36d2c7b1c8118fa1` | 2 | yes | yes |
| `plugin-tooluniverse-fastq-qc` | `9976414fdc6de0b18bf58a4b35600e37ef3bcf957d158c821f0a2717c01f7133` | `47c0281196ca24ee4517f680f357d4da9be6a4499f679478e189f3f6eb267fe5` | 4 | yes | yes |
| `plugin-tooluniverse-functional-genomics-screens` | `937ce1aebc25fa9fb45c9727b7b15542d05cd502ca24d2f42e64c55654d0f7df` | `f8ad3aa6d9598ab9316861aa7ffd6b9336e83a19f267e0a293e884e008198f9e` | 0 | yes | yes |
| `plugin-tooluniverse-gene-disease-association` | `f69b135d56869e8551dca2c792073b1d8c784e55e14970e42006143074bf7871` | `4cfbd9092648a1463a742e9d25c52cfe77990c14162e1d8480533b90634aef9b` | 0 | yes | yes |
| `plugin-tooluniverse-gene-enrichment` | `cf83cfdb5aa62b77a8c92dac5ac827030c54ce4d9173e67395b566c14523d363` | `551f6c8b36b24f8face8fd4ec8eb175d7ee9a9850b833c02cb263e94c3b72078` | 9 | yes | yes |
| `plugin-tooluniverse-gene-regulatory-networks` | `9c3ae9da978f82a39916a6dc31b7ea7abfb626404163fe5c3c070b4ab038ddd6` | `e399b72e6549576fe5e4bbd4e3cbce24c213259b677e533fd71bf89e9c297d25` | 0 | yes | yes |
| `plugin-tooluniverse-gpcr-structural-pharmacology` | `9a1c7ae474397306e0afc8f693d474e184d9368d3ded75e24d12b6fd07a9a4e8` | `55dd4f8fed58e82f61a5057cc8e9f45a1906d14d5a2ce10936ca78a7accc3447` | 0 | yes | yes |
| `plugin-tooluniverse-gwas-drug-discovery` | `f1bdab32e53a1660efe0b2f56f9e578993f71791a41ef42e641023b63f6e5c2d` | `cca15898a2ec2ce91ddaf494c32bee92f441d3ae3bf6fb9b08b6799b8ab9bf05` | 6 | yes | yes |
| `plugin-tooluniverse-gwas-finemapping` | `4826862ce7cb6ceff702ea7cac2ad1082a04307a9afedf22417f20ba9f0f31c3` | `7ec4e9c82cb04e95b8aafc37e14fcc976e9d6d976a6510b07f5fc5caaee794b2` | 1 | yes | yes |
| `plugin-tooluniverse-gwas-snp-interpretation` | `585569c04ccc53df087eaf93dcfb2dbfc63001487490adcaadcb6090b6d60976` | `70a520a13bbe39bced64c816124f1e34b35669dc1efa34803d84e20d0bbd6b5d` | 2 | yes | yes |
| `plugin-tooluniverse-gwas-study-explorer` | `57e3898aa45e12073191778c6feebe69bc0953529c838ca809645301a0d339c1` | `14e7a76359ca4368fd5816a2b3dfd0418499e8549a5afc1e69f14ebb97c63a8f` | 1 | yes | yes |
| `plugin-tooluniverse-gwas-trait-to-gene` | `604167d409cba697f2425969b76a553ebf7ebecedb0a37be8f912b1df3b183a6` | `71058cdd0094a1def3b34ddab790f8a90c5bf0fef77f5bfde938a1364d05b54d` | 1 | yes | yes |
| `plugin-tooluniverse-hla-immunogenomics` | `3bc6cc03b63b644e3d99bd5e502d8f002e4f536d65b2f7a6a18639d9b3572f93` | `ece907d4cfe071d9e5f5bcfec8b59af297cb5e1e98f31b60b38f03fe5ba0ad98` | 0 | yes | yes |
| `plugin-tooluniverse-image-analysis` | `eef94f9091c7949f4312e4eeceba2f435bdf17af18e597e7a814431afc757a83` | `47455bfd9c59ecb486cff4114ccc4078a6c728b9282068375177cafb4c823daa` | 9 | yes | yes |
| `plugin-tooluniverse-immune-repertoire-analysis` | `44173ec5d9335b97633b16b838a691d05ecdea8c8eca71ab325c6fd07e603d30` | `95d4067b25c4fd02634df85c5909a3f36d943c7df7dea4baf5974e12e6024550` | 2 | yes | yes |
| `plugin-tooluniverse-immunology` | `a7939412f3d1b5678d07922cf18568d194fe67760254e327e6253b7c3a26de75` | `df97b898f46c6877d1cc48f8baa7cd14e04945a51c864e4b13ddfb71f3f9059f` | 0 | yes | yes |
| `plugin-tooluniverse-immunotherapy-response-prediction` | `e315a4649c5731e26f21182c0a4f0b2365b1922a34fc80a0f62129d0de988f7c` | `61435771561ec803d23655bf983219110406112f97765a6ae048b2e06b6a7942` | 5 | yes | yes |
| `plugin-tooluniverse-infectious-disease` | `3d5c94afaa55b8513761a0bee165463f980132b91fdc8ea3d48c088d737e03e4` | `3f185d4fac3dec7665767d11fb34708c59bae38e2aa66577cb5d8701b6082840` | 5 | yes | yes |
| `plugin-tooluniverse-inorganic-physical-chemistry` | `982154a7962dee9ce42c3404fc97740e83d03cf71b3cbd8a753efa89dff7d31c` | `0ee151f15158e627ddae4ab4279f0a3dad0c9f2142f020aa7195c6ee3a4580cc` | 1 | yes | yes |
| `plugin-tooluniverse-kegg-disease-drug` | `ae16eeefa4e6eb0cce8a0c24e0f9fce7ec9794e72651ea7745e8befa0300cec8` | `13899987567186d57f795b44e1ca00bc23805e82cf5ed40dc3dc16ff15034802` | 0 | yes | yes |
| `plugin-tooluniverse-lipidomics` | `0ce1932a9dd446b400065eea8fd9d3fd6238792607c884f2ad38f9884fb49aee` | `08fb3bfe67e4e87890df7b6642412f32731bca9a65123fe54af38d8743aa5635` | 0 | yes | yes |
| `plugin-tooluniverse-literature-deep-research` | `11cf08cd4549589430f056663e38fb39c11032346598b392e74760d75b784bc4` | `2d626c0d1ed7c9738f8eb3db290ebab79f75538f50045b7f8d49df8ec47a940a` | 6 | yes | yes |
| `plugin-tooluniverse-mendelian-randomization` | `472a11034a5c271dc80700881e1121323118ff4dedd085d8638c89c4e9cfb9db` | `2461861006e45c97cbc8d65a53e9d5b4d9657ad063a12c128ba7ecd16d8f4006` | 0 | yes | yes |
| `plugin-tooluniverse-meta-analysis` | `4fae467fe102f2bcdd34986da07612caef8c293373d2a1e8f1431c2d52ffcdd2` | `4fbb11b14cfa934aa9137ae1a75288544f43b52b6236cf9bb7b52403804cd656` | 1 | yes | yes |
| `plugin-tooluniverse-metabolomics` | `06a5c495a24684a0a367ef4760952b97c43ad090c3a8d2f03f2f4d4f6250144f` | `4f1c1b8b8e00e81a331c357b5ce06feaa6c8b8e1126d18733b7e6085c610f50e` | 11 | yes | yes |
| `plugin-tooluniverse-metabolomics-analysis` | `9757d250751e9aa9eae4e299273bd270c06d830b85b144cb07e08a695253083a` | `751ffc9ac26be71cf247c8e8c11c436168fbfa849b58af5306c6596ed3edf7cf` | 2 | yes | yes |
| `plugin-tooluniverse-metabolomics-pathway` | `6c0cb920d647bda385604a08266440c528e25effaea03e63fbaf2cb69a180838` | `b67578975fe1af3a4f4bebc6d25aa893178090454df8435f0f98bb1e59de4f03` | 0 | yes | yes |
| `plugin-tooluniverse-metagenomics-analysis` | `e503eabe1d9bd3d05b139fa1ef4f9b63f30b2984ffd5b300ca1b6984270dcd08` | `12d1c32a43a19d56601c9e514ba08d510175cb4a791528d775ef60ed201331f0` | 0 | yes | yes |
| `plugin-tooluniverse-microbial-genome-characterization` | `5b82e7b81b8171953a186f3993bfd92d1cbbaf0ec2dbf7e733c79c47b164f9be` | `295e9bf17dceab619d16eb3827b2c3c2c277cb7b100958dcaadc7dfe60b11da1` | 0 | yes | yes |
| `plugin-tooluniverse-microbiome-research` | `48b33cd929d53bdd9cbbb5ec601ee0a6c27b991a673610140635e2725a9b92bc` | `9803bdb453f12924292f89870fcc9151c0c22cfb533bb75fb05ea3af955701fc` | 0 | yes | yes |
| `plugin-tooluniverse-model-organism-genetics` | `fd901a3df55d5d1f2f14479c77ae4c1030194a177f1cc4e66bdaaeaf9fd98dae` | `befdbef8cf527988c2a6f2ea28eecef263cfd7d857b3305443dd387708d74b25` | 0 | yes | yes |
| `plugin-tooluniverse-molecular-cloning` | `af0279392c6db8d8b500a14d309417528dccf21c64b9a0da0825b7bd8f7b1814` | `964abb6eac594f226de4958790f394ba98fd9eb2f3858e554869281950a50fbb` | 1 | yes | yes |
| `plugin-tooluniverse-multi-omics-integration` | `609eb9aea6274fdef9127d2a1cf3a92faf7d95920c77e13fbe57755552a84160` | `358f309a31afe835e4b13dc9a9d971d6c101d41f620d64e91af5cb7ac9713d46` | 1 | yes | yes |
| `plugin-tooluniverse-multiomic-disease-characterization` | `911bc6a02b559040184e8134846a36800255dbbaf410191bf2ca40eae8a205e9` | `36bf61aad7eb1d9491514dfbf215c0f858455fa5398c72dfb308a38ce40168ef` | 5 | yes | yes |
| `plugin-tooluniverse-natural-product-dereplication` | `b1a4f613b86f9b81af75479cfe80564183e85921b1d0db23ebbd53c9606eddf1` | `c1e97e184be127054b3a84849964af4b92fb87e7909eacbfee5a0d5daea0f003` | 0 | yes | yes |
| `plugin-tooluniverse-network-pharmacology` | `71243da03e0b05e29d2bfc487e10b95823db5d60e198390e4b1beb611eb749c6` | `5b290bc8dd4255eca4644a2a7e64e93564fe7fef0c7bb0cb06d572111d39a4c5` | 7 | yes | yes |
| `plugin-tooluniverse-neuroscience` | `e7e592a3c452c861e2a59da5c0fbd747ef9bf9416d469beab929988da5741f95` | `5572ed790cf5bf8e25218e0e28818a797cd579945bd47be31ec3d79ff2914728` | 0 | yes | yes |
| `plugin-tooluniverse-noncoding-rna` | `93b6468dcd3b7c3048c64a8f2e48382c8d4fa25bd3c4a0eac13819b9fc6b37c5` | `c457d97a9d0e924ce6037cdc6727d45b2e0b33aea0aee8a9c6787de4ad49a162` | 0 | yes | yes |
| `plugin-tooluniverse-organic-chemistry` | `66ac7d8c67a59e01f77bf31dd65bb78ce76c883e1347971ee500c7d6ddd7a3d0` | `3dc51cc5f3691d89d609f14f44dd64f2640400eafb89be491cebcd6f43366b0e` | 7 | yes | yes |
| `plugin-tooluniverse-pathway-disease-genetics` | `3b53da03eea4b59c9b756fcca716418b38411df0769c6088a2b78d0d41b7a86f` | `a5ebff1cd7a715df9f71fcf55f900e4f2f860d1e9a656112ed0d0921f7abd5fb` | 0 | yes | yes |
| `plugin-tooluniverse-peptide-target-deorphanization` | `bed39a3d72d711be146318b05598afbf5324aa7e89b937e796bae61a79e9218b` | `0185888f341904b45cd12a7163b78bed5031c6494ede811ac64c8729619ca307` | 3 | yes | yes |
| `plugin-tooluniverse-pharmacogenomics` | `582fe121f32896f5cd707e31d1b5b1aceba6569935785766ed3c16e552b1c696` | `78ce1c7b90df3f76172f862e51bef6a9e640dbc3a8c1cec601e525c63d944aa2` | 0 | yes | yes |
| `plugin-tooluniverse-pharmacokinetics` | `005fcbeba81af34c3f44860cd83e5e233a05bd2d0997072a6f5d78ba4ed78433` | `a3fde7e72fe9f03e7f9a507abfa049c4b897a9004ba7cdc0139e5ca570c5b43a` | 1 | yes | yes |
| `plugin-tooluniverse-pharmacovigilance` | `bde1b81656f1ab64284ea8f599932fbe10a9aebe14e22eb9d1e76029039a42a8` | `115a6177465447fdb2b864b99432a6dc9055c351bf2b006782a0bc05f70ce22d` | 6 | yes | yes |
| `plugin-tooluniverse-phewas` | `0fc394a199e18dd07586b121c6e71d80ced7d6b8d36b05541c3073dfcaa6e6e5` | `8c6b41cd158afe25cc731afe643397ffe9a9f4e5284a1bc690736d42a4f57809` | 0 | yes | yes |
| `plugin-tooluniverse-phylogenetics` | `024989794ba75bc9ba87afe19fe8bf13866bc0d592c0acc09b2ee1c13938a657` | `8561268c3bae30bad22ef403d8d2fb3efce8a21fd9aa1dee038d340d32c23860` | 12 | yes | yes |
| `plugin-tooluniverse-plant-genomics` | `2e20de347c581dface066e48d07e955c7991c8cd0ff0b82aa5678a3230f12dac` | `acdceb480f49c9babfd4a97d1b147ca1bcef05b2df316cbc2b9097b28fbdb421` | 0 | yes | yes |
| `plugin-tooluniverse-polygenic-risk-score` | `b8831e34d642c3fd358aab0986758ebf0bc7f2722724dac33bcf52d3f411ae91` | `44d7c272c330c220981fc6794f90b9f94f7f3bbc73e2f9c2e0145ef53bc3d181` | 2 | yes | yes |
| `plugin-tooluniverse-population-genetics` | `d7250f10f080c2f3ea6ef7e24f34a707eb6798726c3dd32a94c4afe133bd55fd` | `5e1c41dfbe8eb1f889b77396c0db6dd11887f82570139a0126e4e13ac224cc2e` | 1 | yes | yes |
| `plugin-tooluniverse-population-genetics-1000genomes` | `ba96882af77f1f5741d139a82509b0cc5803e11d1cd5434db6c88ebc12667687` | `b141ae118d0eac0a2b2f0781dcb3cae8b5c6a9cfa2054abb54d57f6fb85a0aaa` | 0 | yes | yes |
| `plugin-tooluniverse-precision-medicine-stratification` | `e9968d8d155037402dda81dbe3d6d9802e2b8f4f1e780310bef16c703b7b7178` | `7fa38d030a054fc8bf79d40fe6724bc974b03e440d8fe4eb05964e5f603f95a1` | 5 | yes | yes |
| `plugin-tooluniverse-precision-oncology` | `8fc4338e8852966c9053b34ac4e8a4c021e5d9726da891fc0cb68c39898e2845` | `4514b4586b18a58e8a088d72f501b91f24154d85130920fa980d21ae16ca0572` | 7 | yes | yes |
| `plugin-tooluniverse-primer-design` | `d08cc5c9178e590a5393708a94f5b8467eaa20e972483a8de98bc4a168543195` | `d6931e13afb6e8b75e9cf2a8803e3a8a7e7b228bf623e6fb290ed10db4cb5819` | 1 | yes | yes |
| `plugin-tooluniverse-product-safety-surveillance` | `140d924d6b2b26b99bb1707d7307fbb85fa79d14c33f329eabf89a81f5c5721e` | `ca080a6b81908b6c2c311ae740acde030a90aa81a07560db112f30eae75deafa` | 1 | yes | yes |
| `plugin-tooluniverse-protein-interactions` | `58eedbcdf115cdef2827dd09cfaaa79bef527ea06e9e47d361678a8526f18ff4` | `5eb5f3774446dc5f9ec0b7bada219e020a7e94d1a48d8c17a918a9ada5eacbf3` | 6 | yes | yes |
| `plugin-tooluniverse-protein-lof-mechanism` | `87e029c9348782cab3c752d705ac37f5818695c6545bdcbb7000387f17df7de0` | `1f615d4b44b8261789093d0bd26f635c1c3fcb116254e8d61e13da85a9cdde1f` | 0 | yes | yes |
| `plugin-tooluniverse-protein-modification-analysis` | `efa8c83009852683026bfba39df053bff2a3ac823deb694dbd09bd233fbf2a13` | `c94ce710e206f69409bf4d06ef33b0a9d445945c00309d64a1d72b9dc394bdc7` | 0 | yes | yes |
| `plugin-tooluniverse-protein-sae-variant-interpretation` | `1eb22e8330b9f8575da265a205d8044c25561ea5c1eae825f19384a99f9902e9` | `9dd5952af0fd440e1b85eb37b257616efec12a9891f49abd7828f2d2f1e4d605` | 0 | yes | yes |
| `plugin-tooluniverse-protein-structural-annotation-pdb` | `9bc21650abd55bc98626a29ef8567baabe74234e5239d185a3743512b289ed87` | `f6d46b45049ec8de00f8c2291ccc601ccba697d2d22b1ea45368ecaaf566eec3` | 0 | yes | yes |
| `plugin-tooluniverse-protein-structure-prediction` | `ce690d683f7197333e056757c2ca5bef1e8ea9d991ea520158f1389f47079dcb` | `c3cea2a40bc63d353fa8766b3415f1d7d8cae594a2f938dcf7d7230e82d95b5c` | 0 | yes | yes |
| `plugin-tooluniverse-protein-structure-retrieval` | `dc3c02ee013d2eca99f3c14eef8751855da0bbf327f61cf90acb9c1c9d5a4483` | `d69571429be7b9d909e9a5b9f78b401c03ab55b6021a330397d6a5acdd1daecf` | 2 | yes | yes |
| `plugin-tooluniverse-protein-therapeutic-design` | `4dc5905f10c3048c2089640e699fdc512c9d2f8eafbed57b26acc8cc06b7293a` | `a3acd084cdb8171f7d34d917a891ce43d43c6a24854d8f2aae334f694abf9788` | 5 | yes | yes |
| `plugin-tooluniverse-proteomics-analysis` | `a53faf0ee30caf8706f793d9c7ae5ede8959fe58c0a6aaa2ad6a180d36df55ee` | `d66489b3519bfa252509cea833fc85f0b5f722b0122645d94d6511f4f76d4c42` | 3 | yes | yes |
| `plugin-tooluniverse-proteomics-data-retrieval` | `97aa63c9fa917c9a2eb122aff76ed0fb224a4d46e1fc8be8ece3af728dd14d72` | `23c6059d494edb1a80570ccfd07452373f17e4c841fb628d6e00ec15e3d28c72` | 0 | yes | yes |
| `plugin-tooluniverse-rare-disease-diagnosis` | `776384d56144329e2501c94bd7889878cd35f7a9292ef10677c20d5b6a77e5e7` | `554838f0e320980aa3f9786a9fce1646aba363b1794f485c1210126284910120` | 6 | yes | yes |
| `plugin-tooluniverse-rare-disease-genomics` | `db96dda4b8ab52280f3b674ed740e9962ea74de3d6aaf9c8e71692e461681613` | `6ee4139fe3a8fe9deea449136dd5053eed63ed1d7ee078f4b8e711fc4f3bdca8` | 0 | yes | yes |
| `plugin-tooluniverse-regulatory-genomics` | `a0a82a5b50efa51b294bc7f7e22d75a5e774c48bb56960ac3011c6de6d2f00ac` | `2948137e251e547fd266f097e0f1fd774c244d722e875c5176ee26d33fab3e0e` | 0 | yes | yes |
| `plugin-tooluniverse-regulatory-variant-analysis` | `5eeab1c468e069983637d41ed593bddf7afcee9f73ca9c7e92d5c78d0795bc91` | `5085e08a1dfbcd0fa4e5ab477a02619794c6112b58adfee22c97de7743c36f26` | 0 | yes | yes |
| `plugin-tooluniverse-residue-functional-mechanism-interpretation` | `b80916d325a35ff15112b67e938d1061acd772c0f3fa07863aab064ec17fc60b` | `bf4926da8eb0d2bf073e756d4eb65771d2166bae2b954559593d20751d665520` | 1 | yes | yes |
| `plugin-tooluniverse-rnaseq-deseq2` | `530f29caf30a3c48262fb2d9faccf3e13e47d0eedc7b0c0a5f2f6c4c001ee3a4` | `f407764985ea677d19559582566067210bc6dbc934843a6c60f6d79521def567` | 20 | yes | yes |
| `plugin-tooluniverse-sequence-analysis` | `f39c9edd8edd44d5dd422ca3c573b46d50eb89d36c784e8877e1c1173650597f` | `5dbb013c68adadee25cc23dde61d6b7fb530b043bf124bcd3639e20ed30fffc6` | 4 | yes | yes |
| `plugin-tooluniverse-sequence-retrieval` | `a2e2b93780034ec4303d5256f37f59709b1b5ffd81b99e55606b15bfd0ed5e2c` | `109db966f9aee0a16c2ff5479f1b0365b75061a2407ae99dd522015f3f300d3f` | 2 | yes | yes |
| `plugin-tooluniverse-single-cell` | `940664887facf36b6fa36e3f15d23a7901f5186dca98297068284abdee93a927` | `9347f4e6555e75df2b30837d5a85b53b1161f969fb7c0b38a3904f4263dc0836` | 13 | yes | yes |
| `plugin-tooluniverse-small-molecule-discovery` | `2154959d4a0b64020b23f514a61f1c2c9259f14e1a91b4a2a2466897e0f72b61` | `58f1dfd741a6ff6d9a1aefb11d6c7661c4aed7667fa722d6146450d70437defe` | 0 | yes | yes |
| `plugin-tooluniverse-spatial-omics-analysis` | `9b793671ed0ce98f553c838a9370518f4f5d90d2cf1a91fee9dbd4df0ad44cfd` | `5ea136c1b3dd4fd1e2acb0f736dc8b578f943761e35320f02edf455f7961860d` | 4 | yes | yes |
| `plugin-tooluniverse-spatial-transcriptomics` | `8409f1a89383cbac4e8cc08e1dd6b089fc33f1525f13456f6a8be978b3606207` | `19ddc28d043c518b7b977852f7fd62b24d358ba9a3d262fe81289ea876f5754c` | 2 | yes | yes |
| `plugin-tooluniverse-statistical-modeling` | `92244921378c8f4a0abf5afcbcfc4b866a14d1b48f315ac51bec9672c1da532d` | `ff3f9a8e1edc0f82e224e2b59c3a5f877de9709c36460bc22b3904a0d0fc51b0` | 21 | yes | yes |
| `plugin-tooluniverse-stem-cell-organoid` | `f4981f6181a426bd52893d9a1abd7d4d61d7d0cbb3c8ec14fdbfa32da78d777d` | `30da1abb5b80c774aa6a7d174b9cc6b4a3988f6bb2a3da0d581fd9aff9b5bd27` | 0 | yes | yes |
| `plugin-tooluniverse-structural-proteomics` | `dbd89fa58f691423deb7aad1a23ad45da25317014fb3cf8b097753815022f915` | `19c0173af654b12e26bfe6443d7c168026fcf70ed5f4d6271da264a6539f3391` | 0 | yes | yes |
| `plugin-tooluniverse-structural-variant-analysis` | `fe16de9dbabc862594a93bb7697b76ca57f757852ff1cf62463291843096963a` | `f8c573ee46084f0682523b6a4a0a54581d519505d795275875654b85e412b7f7` | 4 | yes | yes |
| `plugin-tooluniverse-systems-biology` | `20057a5e8912e3d1b32528880d2444047f07a190710d9529f1de135356106e57` | `a9690dbf3f197865a414d2ba13e728aecd42e2e6f9cfd2cc601d13081f6076a0` | 5 | yes | yes |
| `plugin-tooluniverse-target-research` | `b2803d6d4857095fc81c8895d12b2db69662b140abc74a99fabc0a550234fb13` | `d065a63ca8fc6200b03681298581f0ded9583cf39dc37f6475b71de8fa29b9ac` | 5 | yes | yes |
| `plugin-tooluniverse-toxicology` | `37d9543dea2b1e9ad8432ca36d7aa8af40ee0469d26a4c0ab8a385eec381297b` | `f124f3fb0772eaf3152fba3ab21950ccd2277a0a72ad4a4bcf136609d832e5b7` | 0 | yes | yes |
| `plugin-tooluniverse-vaccine-design` | `0a94487e30e83c1279465d64979a5bb0a341bc3ac4d3e0b886d5e13372f6002c` | `615477f940158241547bbde6318593c637856d500c4fa980e22b19b060b39337` | 1 | yes | yes |
| `plugin-tooluniverse-variant-analysis` | `61616eb509616d12d7abec8b0ef9e91d29a04a3af1732476ce4d3c4899637259` | `156f48f7c57f8cc4af73290fa6f686820263cbc3e7fcc023781ab5a5d879067f` | 13 | yes | yes |
| `plugin-tooluniverse-variant-functional-annotation` | `f0047d0b5750eb87e38412d2c22c22ac255a603618fd13e2b3d1da8e796ee9e2` | `205e2f8ef6e2a3b98150875c0132b13bd4f3b98be4a75bf49efadb80d87dc81a` | 0 | yes | yes |
| `plugin-tooluniverse-variant-interpretation` | `c2683111ac5669f9ab299b0a83cef84743af559cc222cada5c0162b3aeaf3b60` | `456a72fbef19327e5b4df8abd09cdff40dddf3b8131290d6efe5cdc4240d9aa4` | 5 | yes | yes |
| `plugin-tooluniverse-variant-predictor-dms-validation` | `9784c45c13465d69dd7a712202e9c432ae96eb7c06778d1d16576152c419514a` | `e80de8bdc7aede90a595d502921f5d4d6159a4b4a133d463322a62fbbf104a00` | 0 | yes | yes |
| `plugin-tooluniverse-variant-to-mechanism` | `8d3720ce63375aff0f7df7e70fef40c4ba436c44812fb8e914c8661a1909f0d8` | `ad02849d269ccd9426860e43247524568f688cb9bcd8b3805e9246e9a904e17d` | 0 | yes | yes |

## Machine Review Artifact

| artifact | path | sha256 |
|---|---|---|
| extension review | `audits/tooluniverse/v1.5.4-8ec5d4b/artifacts/extension-review.json` | `0105f787c4a7ce6f6adcdef4df4b3f82b90b12bcc0fae22bb8070280c99037df` |

## Static Review

- 逐能力语义义务及权限边界由 Agent 审阅，见 `05-semantic-review.md`；机器输出不建立人类确认。
- [x] 命名、registry、审计记录、锚点 manifest 身份一致。
- [x] Agent 语义审阅见 `05-semantic-review.md`。
