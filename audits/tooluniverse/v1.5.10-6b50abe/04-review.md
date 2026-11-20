# ToolUniverse Extension Anchor Review — v1.5.10

## Registry And Domain Review

- capability entries: 130
- profile entries: 130
- ToolUniverse 领域分配由 `src/plugins/domain-catalog.json` 自动镜像
- 每个领域只包含其 reviewed raw Skills 对应 extension
- extension capability IDs 与 raw Skill IDs 不冲突；与 bundled capabilities 不冲突。

## Package Review

| capability_id | package tree SHA-256 | profile SHA-256 | tool files | tools byte-identical | required fields bound |
|---|---|---|---|---|---|
| `plugin-tooluniverse-acmg-variant-classification` | `23fbed8d074d9ffb92ba57ae267a14563891f18a3fc1ffda84052d16a8291dde` | `9cb2cf5f00ecf224cf7eb5c27856a04f76eb13adb5c91c927e4a5f7062396c2b` | 0 | yes | yes |
| `plugin-tooluniverse-admet-prediction` | `6e33d9b0403efbd736445a0742c49c9ceef75ee50606969c9318547ae9d480d7` | `478b4a4f591c35df33d11b5dff922d9b944966ba333573a475159a8f57d02fb0` | 0 | yes | yes |
| `plugin-tooluniverse-adverse-event-detection` | `c75986aa7ecc99d6ff9ef19a652ccf94e16c7493bbd825af49cf708e402b4029` | `d651e8280ced640469701c4a239e9d70d426162d991f850b009535099e1ed7e0` | 4 | yes | yes |
| `plugin-tooluniverse-adverse-outcome-pathway` | `8a1c3c222213aafd734cfd63e66a4c16cc30ecf134437982041ba3228e8dcfed` | `a1e22a251693c28e7e366e512aea2ae888c0c5823e31d0b4626dff0e70fa7502` | 0 | yes | yes |
| `plugin-tooluniverse-aging-senescence` | `960567e751fa5f416a9c706ab346540ce9591e6c0bae1843e1d0744fffb786e5` | `686ed247ff738d79ae6802763cecdb6048d72e6cdec577fcac2f1c4032959cd8` | 0 | yes | yes |
| `plugin-tooluniverse-antibody-engineering` | `9d5bd1910af91630e0c72d491e87df7f2c7b72767a9f9690c7f53fd48d8fae25` | `51a68a5dae94e63e9bd7b18c877d3e7393cf0762bedd6cf71ca091f026e32ec8` | 7 | yes | yes |
| `plugin-tooluniverse-binder-discovery` | `2a9416491c16d1a9ce3ed41ac2ba5bff9b4dd970f4d967675faa9287165d1dbf` | `006b1ccfcc1275d2d75459ca40ed15a394dac57dea067e1241744b9e5d2c8c46` | 5 | yes | yes |
| `plugin-tooluniverse-cancer-classification` | `e2a505f4798045b6a3b77c05d88010771d0663b13c3c2b6b1b7c52ea4c22f3d2` | `5f73232d7319b1db95b048dc0fc40b9e2c996e438fc6d0ca4ca7e8ab29d922dc` | 0 | yes | yes |
| `plugin-tooluniverse-cancer-genomics-tcga` | `90b06b75c0bda45409b176af1eacf1172f73e62140cd1ff77ef1e7f1f00b2bd1` | `93252bb130f247228f2b2518869bb4748b79015f316bfc1d4e89c9203901bd49` | 0 | yes | yes |
| `plugin-tooluniverse-cancer-variant-interpretation` | `8eaf8a865c7896a33adbbac7d6d5041f663521f834ad7fac4be8280f46ebe26e` | `68bf82499204b30be0c825e6afabce3e4d6f0bda7db7f16d67a69c038f22823e` | 7 | yes | yes |
| `plugin-tooluniverse-cell-line-profiling` | `aed427f1ad7c292385eba6564ddee1fcbfba0a77c287ff6653f63c6fac6fba96` | `c9ecf59fdd873b2d68deb8987122ebebf7d4b6d0b75fb74b714c845a0d4c965c` | 1 | yes | yes |
| `plugin-tooluniverse-chemical-compound-retrieval` | `0b7e80915a4e6c209609bfa6a2b03a0c974b43390831033a6312f7e6a12ade40` | `1e656fc2fe845ba6c14163427a74f0dcf4645299e017ca3dc1048f1317c1e7de` | 2 | yes | yes |
| `plugin-tooluniverse-chemical-safety` | `0117edd09e081343588a9f6104cec4b73e5401f01019ea352c45a768f1b2a883` | `fe9c96821d68e75b07b656a0de7452515203595edffd39b048f626eb69cfe95d` | 4 | yes | yes |
| `plugin-tooluniverse-chemical-sourcing` | `4d0395a756704720eab82a7efe6987fd9df73ed9a6e3476bd5d5dd33723f9e46` | `dd26161461a2bf461fb60aa2b3017b19cc18d83d6caac42c74998821fac88f94` | 0 | yes | yes |
| `plugin-tooluniverse-clinical-data-integration` | `27705fc6544ef2037f25b54e1e29a34a579026952c70f7761b0c99361c93cd82` | `6ebaa61af6fa8c6cbce7346f48d138c20647e45e16e7230b9f8a2f7e96767e06` | 0 | yes | yes |
| `plugin-tooluniverse-clinical-guidelines` | `90de6b32d1478d2aa176c5aa01338b89274e107d7b015663864031a9729c980d` | `ed62ae9356ec4a52e5a2150badc31b52df99719a89db8e7d65675c552019dfaf` | 1 | yes | yes |
| `plugin-tooluniverse-clinical-risk-scoring` | `3d04e0587d378fcafcf5f671b6a1e7c12140f4d131d7853a2dc498e959fc81ce` | `08436ef620d2b0ea0cfed0798b5d5c44c4d841eef56f67f8f33a5fb7d1c74781` | 0 | yes | yes |
| `plugin-tooluniverse-clinical-trial-design` | `744bfa65022296be2185a81aebf032ce32113ac4995ec6d1dc71f40837138273` | `d183445e60121350dae3ce0484985216c2ca72ac6594932b5c4fc4a40859078a` | 8 | yes | yes |
| `plugin-tooluniverse-clinical-trial-matching` | `7a8b007ea11170a8861af1de31372f393738edc6cffd80c3d570e6d7a8008f4f` | `df1716dc46465ac91d9ab674c73426532fd4620afb5a289566e045ccfa6c4647` | 7 | yes | yes |
| `plugin-tooluniverse-comparative-genomics` | `2d0a19999940a7af61004880fb8b5296e825c5136d31e0dcf96c7a87f8abf8fd` | `5def4c1804674ab1d6c4f948ae88ea7db73477a19808fcb859a4255bc48540eb` | 1 | yes | yes |
| `plugin-tooluniverse-computational-biophysics` | `71684dc8b946031acf42913957f78c754d4264023ba954eec73023e114cf691a` | `afaf4e8f17467ce2c8d9c6fb2c3cbf57f3142b0097128d6daeb864afc2672847` | 9 | yes | yes |
| `plugin-tooluniverse-crispr-screen-analysis` | `4c133e1f4d287eedc51625cbe1301e30c16fe851a910f098a55ea92c991b2d33` | `0731f8a9fd9027420ff179a54761c9534c35f55b56826a84a40994e8f01f33c8` | 8 | yes | yes |
| `plugin-tooluniverse-data-integration-analysis` | `309570a6dcf8cf4e95ee7f10f73e50df9fa6194e868bd5e3e3179862621c80b6` | `745c7fccfbba7e9824f883ae668c102c98252c8eb7c572a1b3de96cb08745ba5` | 0 | yes | yes |
| `plugin-tooluniverse-data-wrangling` | `5f2ac1f14109ba20d1e71eac86402c56645b283cbee3c8e44a7b2eceda1386ae` | `5427932ffaa12154a3b671d21dc2f5b4a178c7a31a10f6060d3eca851903c4b3` | 1 | yes | yes |
| `plugin-tooluniverse-dataset-discovery` | `9bab10086dae138c84f39c99e5909e6ee36428144f3ffb05473cba2a1c2aae6b` | `fcbba3e587f3d958a022304a1156a1218b9bf558be8fd29d3ac25a4ac4a3b1e8` | 0 | yes | yes |
| `plugin-tooluniverse-diagnostic-test-evaluation` | `7179cc1f0ba5ad998e23f71a87714734f543d94c71d5790cd6b6328c98e4fc12` | `22ace5cb66388f6b9a14dc5b543871335fce3f58360d7f9674b1dc7ad4517ed6` | 1 | yes | yes |
| `plugin-tooluniverse-disease-research` | `863d1778a1e12d0cc7477c1542592451ba037b69a429104a4a38925fe317b9c5` | `375dd0e0d4181b6046fb7ee483d872365d73f2c61c307968fc8db4f44edabb61` | 5 | yes | yes |
| `plugin-tooluniverse-dose-response` | `518c28f974b1f41bd4d6fdb75040a2a796a1ddd4668a77b5b0e6fa81a5c05091` | `d52501dcf4a4b978e8584afc2e543a0437caea39057bb536926094111d2cdd03` | 1 | yes | yes |
| `plugin-tooluniverse-drug-drug-interaction` | `f8c4525571883f28a43251fa16cec2b5a5e92156c240332b377d533cc72bc4f4` | `6c2eaeebc7e319d5850c20b7337f39c9f8d10c564eb3c41f58e8d20e2d613ffb` | 5 | yes | yes |
| `plugin-tooluniverse-drug-mechanism-research` | `d72d7cc871c44dab038fec3f61cd90ed4e16421a2ef1bafb93cbfd94b8607318` | `f9d92f24cb717ecf56b7bcb46c9ee26fbfd41ca40259d64439f2c0c307e91dbb` | 0 | yes | yes |
| `plugin-tooluniverse-drug-regulatory` | `828e8d872ca742999e10453f8af4879cdd213a897d513abaf1315b0e5fe3fdb1` | `6f2f22cde8b7a5ffd851dae5e702ddd094d726def0c66f8bc5dc346548a705e3` | 0 | yes | yes |
| `plugin-tooluniverse-drug-repurposing` | `c8149d48585be7db79bfa488a4abd8741f14cdbbec2f94a87fa6acd3d8ebf303` | `56465d644b60b4d408dcb185f6bb9258c7da849163291a7bd321b00e30b8ab72` | 5 | yes | yes |
| `plugin-tooluniverse-drug-research` | `f7781dea5c161a28728e0ff6eb1be3b9c57a5d35715356e85e2136f38a99c7f6` | `bb3dc8cd2cf9bff6fab4b029a2ddac05030415b2de17ef455bf4f645388fc0cb` | 5 | yes | yes |
| `plugin-tooluniverse-drug-synergy` | `1ea96cee1e95ca9248bd19af6455f041806129f81b7bc2ee173c58a29b2aec16` | `0c9cc7df5968cbc87122bed07fe3080398f88e99eeee1eec98651640fd1445fc` | 1 | yes | yes |
| `plugin-tooluniverse-drug-target-validation` | `da70d781d27c8669f12558571f2454b82540604f957052115847a5924b41b168` | `ed177a9e79a92171c6981c4b14713bcd10417535916f5000e93319b488537fb7` | 4 | yes | yes |
| `plugin-tooluniverse-ecology-biodiversity` | `4938efd1c6d4fcf9c782c01ea9af79c23e661c119d3685c2625dcf7a4554d751` | `cf3709f1a4db060746d3dd010deef7e544cb2307d6bf825747d05f8f11290177` | 0 | yes | yes |
| `plugin-tooluniverse-electron-microscopy` | `3307823c78d9cdba383a00799f68e631af93a1823e6e0eb679ad033291ec2d70` | `a097e4c6af47cec676d1ef9efd78458f39d9daf8579b676127c6904cecda08bd` | 0 | yes | yes |
| `plugin-tooluniverse-enzyme-kinetics` | `49e69076c78885f5627e3f6610c1cb853868141656aa7d4e62ee4f0948d53167` | `c084daa7b6787c8f1710e1a2d0511c16c2295522388ddf9c8ac058e32f7e24cf` | 1 | yes | yes |
| `plugin-tooluniverse-epidemiological-analysis` | `cd070ee2b0b656dd697cdb2cb9532ef0033d8777e562a1a83591d2479a9bf25a` | `e9d30ea1201ec3dcf42dd92d61b9002bc0d77c25956973e83cd15aea711ec273` | 0 | yes | yes |
| `plugin-tooluniverse-epigenomics` | `2887ea3bf6d6d51444d8b6844ac53507326c24e04b3c1c1f12d97ed9496d89a1` | `f07075e3e907ca190e58837cd0cb99aca8bd017bece43572080d71137b8432ea` | 5 | yes | yes |
| `plugin-tooluniverse-epigenomics-chromatin` | `5b2bcb49f6edbcfbed611fd1b99aae1aa6f829156c248ce802a59bf168429fc0` | `eb6a58f276f7b2075e1a215c2a8291530c56a3badf35ca9493f98c56b4a6bd4f` | 0 | yes | yes |
| `plugin-tooluniverse-expression-data-retrieval` | `d289168c64221c71f2d6b4c610f293c6f0ff468aecff7ed87c97632d950fa20a` | `6a4b122f0515e0e381f6044a0cb7c3da37ed32b22d2579ea36d2c7b1c8118fa1` | 2 | yes | yes |
| `plugin-tooluniverse-fastq-qc` | `9976414fdc6de0b18bf58a4b35600e37ef3bcf957d158c821f0a2717c01f7133` | `47c0281196ca24ee4517f680f357d4da9be6a4499f679478e189f3f6eb267fe5` | 4 | yes | yes |
| `plugin-tooluniverse-functional-genomics-screens` | `f29055374542936e7a33c3bdaecbba7449b0b3f463717dcd7f9804dcaac1c93d` | `f8ad3aa6d9598ab9316861aa7ffd6b9336e83a19f267e0a293e884e008198f9e` | 0 | yes | yes |
| `plugin-tooluniverse-gene-disease-association` | `33903fe97c6333d8500404c76163de37a5c720c43fec245d438a8b1965d3883b` | `4cfbd9092648a1463a742e9d25c52cfe77990c14162e1d8480533b90634aef9b` | 0 | yes | yes |
| `plugin-tooluniverse-gene-enrichment` | `ed8c04fb589950182f88b8434ce2c8487701d98dec548d358eee814f9ab4db84` | `551f6c8b36b24f8face8fd4ec8eb175d7ee9a9850b833c02cb263e94c3b72078` | 10 | yes | yes |
| `plugin-tooluniverse-gene-regulatory-networks` | `9c3ae9da978f82a39916a6dc31b7ea7abfb626404163fe5c3c070b4ab038ddd6` | `e399b72e6549576fe5e4bbd4e3cbce24c213259b677e533fd71bf89e9c297d25` | 0 | yes | yes |
| `plugin-tooluniverse-gpcr-structural-pharmacology` | `9a1c7ae474397306e0afc8f693d474e184d9368d3ded75e24d12b6fd07a9a4e8` | `55dd4f8fed58e82f61a5057cc8e9f45a1906d14d5a2ce10936ca78a7accc3447` | 0 | yes | yes |
| `plugin-tooluniverse-gwas-drug-discovery` | `e1dcf0b5d0983c0c1930ed0ba7c51a6ae9beb4b45dd549b7b7e58b0b9e8fe7ae` | `cca15898a2ec2ce91ddaf494c32bee92f441d3ae3bf6fb9b08b6799b8ab9bf05` | 6 | yes | yes |
| `plugin-tooluniverse-gwas-finemapping` | `54fdb2df80afabda1a06eb52da194cea82a020c6373a3484fd428e32d6ec0fc3` | `7ec4e9c82cb04e95b8aafc37e14fcc976e9d6d976a6510b07f5fc5caaee794b2` | 1 | yes | yes |
| `plugin-tooluniverse-gwas-snp-interpretation` | `585569c04ccc53df087eaf93dcfb2dbfc63001487490adcaadcb6090b6d60976` | `70a520a13bbe39bced64c816124f1e34b35669dc1efa34803d84e20d0bbd6b5d` | 2 | yes | yes |
| `plugin-tooluniverse-gwas-study-explorer` | `57e3898aa45e12073191778c6feebe69bc0953529c838ca809645301a0d339c1` | `14e7a76359ca4368fd5816a2b3dfd0418499e8549a5afc1e69f14ebb97c63a8f` | 1 | yes | yes |
| `plugin-tooluniverse-gwas-trait-to-gene` | `42eea310a36f43b226acfe7d94462f6cfdcf35e7461691cbf1afccad47f3888b` | `71058cdd0094a1def3b34ddab790f8a90c5bf0fef77f5bfde938a1364d05b54d` | 1 | yes | yes |
| `plugin-tooluniverse-hla-immunogenomics` | `cc7b99719cda500102a1c54a982889cd45423b7eb84028097d4a09ac196316e7` | `ece907d4cfe071d9e5f5bcfec8b59af297cb5e1e98f31b60b38f03fe5ba0ad98` | 0 | yes | yes |
| `plugin-tooluniverse-image-analysis` | `67f56dbfa1a6d2d1e9035aa09f0f799a40ad828606650fd5819a431846b9ed42` | `47455bfd9c59ecb486cff4114ccc4078a6c728b9282068375177cafb4c823daa` | 9 | yes | yes |
| `plugin-tooluniverse-immune-repertoire-analysis` | `9042f9bc624bb1e60a12e507e75ed03c9415fb3b9e04f93644a992df77062773` | `95d4067b25c4fd02634df85c5909a3f36d943c7df7dea4baf5974e12e6024550` | 2 | yes | yes |
| `plugin-tooluniverse-immunology` | `a7939412f3d1b5678d07922cf18568d194fe67760254e327e6253b7c3a26de75` | `df97b898f46c6877d1cc48f8baa7cd14e04945a51c864e4b13ddfb71f3f9059f` | 0 | yes | yes |
| `plugin-tooluniverse-immunotherapy-response-prediction` | `e315a4649c5731e26f21182c0a4f0b2365b1922a34fc80a0f62129d0de988f7c` | `61435771561ec803d23655bf983219110406112f97765a6ae048b2e06b6a7942` | 5 | yes | yes |
| `plugin-tooluniverse-infectious-disease` | `6a8c907662d92d122a761d9091d781b7def6b5ed13e7a641a1306f7e648e8c34` | `3f185d4fac3dec7665767d11fb34708c59bae38e2aa66577cb5d8701b6082840` | 5 | yes | yes |
| `plugin-tooluniverse-inorganic-physical-chemistry` | `05f1db78402709851860efa480f6781fa78086b58018acc90964c096df81b362` | `0ee151f15158e627ddae4ab4279f0a3dad0c9f2142f020aa7195c6ee3a4580cc` | 1 | yes | yes |
| `plugin-tooluniverse-kegg-disease-drug` | `37b1242f249cf37f51bd1944d8231d8546f07214342da57ce4abf50bcd243727` | `13899987567186d57f795b44e1ca00bc23805e82cf5ed40dc3dc16ff15034802` | 0 | yes | yes |
| `plugin-tooluniverse-lipidomics` | `67bf4ab5d3636cc178c1ec1eb87d0601e6396f9f39c451b7b89a8471e7c66907` | `08fb3bfe67e4e87890df7b6642412f32731bca9a65123fe54af38d8743aa5635` | 0 | yes | yes |
| `plugin-tooluniverse-literature-deep-research` | `722d8ae7deddda52e95fd9be4dce523678aabc03cdb30effedf3cf700d990055` | `2d626c0d1ed7c9738f8eb3db290ebab79f75538f50045b7f8d49df8ec47a940a` | 6 | yes | yes |
| `plugin-tooluniverse-mendelian-randomization` | `86281b118a1868231c8d9ed98c5d09f06a69a5c79c86a63a0556447c321a51af` | `2461861006e45c97cbc8d65a53e9d5b4d9657ad063a12c128ba7ecd16d8f4006` | 0 | yes | yes |
| `plugin-tooluniverse-meta-analysis` | `be2d49b3cd7b3b546427d857fc2bfcddc73f1b9bacbe0b50188cdd01e31118d1` | `4fbb11b14cfa934aa9137ae1a75288544f43b52b6236cf9bb7b52403804cd656` | 1 | yes | yes |
| `plugin-tooluniverse-metabolomics` | `66d390f273ad94c759921c65490f0c67ab6f586f8c05e738bba3939340649331` | `4f1c1b8b8e00e81a331c357b5ce06feaa6c8b8e1126d18733b7e6085c610f50e` | 11 | yes | yes |
| `plugin-tooluniverse-metabolomics-analysis` | `02923a81aa6012c333cd3806a237557406ab717b958db3e3eb336d6b0d52a425` | `751ffc9ac26be71cf247c8e8c11c436168fbfa849b58af5306c6596ed3edf7cf` | 2 | yes | yes |
| `plugin-tooluniverse-metabolomics-pathway` | `6c0cb920d647bda385604a08266440c528e25effaea03e63fbaf2cb69a180838` | `b67578975fe1af3a4f4bebc6d25aa893178090454df8435f0f98bb1e59de4f03` | 0 | yes | yes |
| `plugin-tooluniverse-metagenomics-analysis` | `e503eabe1d9bd3d05b139fa1ef4f9b63f30b2984ffd5b300ca1b6984270dcd08` | `12d1c32a43a19d56601c9e514ba08d510175cb4a791528d775ef60ed201331f0` | 0 | yes | yes |
| `plugin-tooluniverse-microbial-genome-characterization` | `5b82e7b81b8171953a186f3993bfd92d1cbbaf0ec2dbf7e733c79c47b164f9be` | `295e9bf17dceab619d16eb3827b2c3c2c277cb7b100958dcaadc7dfe60b11da1` | 0 | yes | yes |
| `plugin-tooluniverse-microbiome-research` | `646a14399f30792cf5d25a0b6b9376b3a4fd42935f1ad11f42c5170ff9e3c332` | `9803bdb453f12924292f89870fcc9151c0c22cfb533bb75fb05ea3af955701fc` | 0 | yes | yes |
| `plugin-tooluniverse-model-organism-genetics` | `bfd968e7b60fb7a10f1b5c3eb30a49c153653525f3b2a42d19a73b928b86efb4` | `befdbef8cf527988c2a6f2ea28eecef263cfd7d857b3305443dd387708d74b25` | 0 | yes | yes |
| `plugin-tooluniverse-molecular-cloning` | `af0279392c6db8d8b500a14d309417528dccf21c64b9a0da0825b7bd8f7b1814` | `964abb6eac594f226de4958790f394ba98fd9eb2f3858e554869281950a50fbb` | 1 | yes | yes |
| `plugin-tooluniverse-multi-omics-integration` | `609eb9aea6274fdef9127d2a1cf3a92faf7d95920c77e13fbe57755552a84160` | `358f309a31afe835e4b13dc9a9d971d6c101d41f620d64e91af5cb7ac9713d46` | 1 | yes | yes |
| `plugin-tooluniverse-multiomic-disease-characterization` | `911bc6a02b559040184e8134846a36800255dbbaf410191bf2ca40eae8a205e9` | `36bf61aad7eb1d9491514dfbf215c0f858455fa5398c72dfb308a38ce40168ef` | 5 | yes | yes |
| `plugin-tooluniverse-natural-product-dereplication` | `2162cdf7013a66c2b85709083ed682461b21a435f267c380415b4e957b557d99` | `c1e97e184be127054b3a84849964af4b92fb87e7909eacbfee5a0d5daea0f003` | 0 | yes | yes |
| `plugin-tooluniverse-network-pharmacology` | `ad70ffc667335ce4db201ae771b29ae25028630466258440320ad1f12c69c0cc` | `5b290bc8dd4255eca4644a2a7e64e93564fe7fef0c7bb0cb06d572111d39a4c5` | 7 | yes | yes |
| `plugin-tooluniverse-neuroscience` | `9688a10e189aa7ffd656228d431120482f5661f0cf4547869a707693659ab3fb` | `5572ed790cf5bf8e25218e0e28818a797cd579945bd47be31ec3d79ff2914728` | 0 | yes | yes |
| `plugin-tooluniverse-noncoding-rna` | `d354a33d6e17b6bda5ecb6f7f99da0982eeab3a9140730cd9ef27688ef8f4601` | `c457d97a9d0e924ce6037cdc6727d45b2e0b33aea0aee8a9c6787de4ad49a162` | 0 | yes | yes |
| `plugin-tooluniverse-organic-chemistry` | `ec9c6c9623cd513a0c6e4d2590e37b3d1e038a51ba39e04f0888fd07ec8c1002` | `3dc51cc5f3691d89d609f14f44dd64f2640400eafb89be491cebcd6f43366b0e` | 7 | yes | yes |
| `plugin-tooluniverse-pathway-disease-genetics` | `3b53da03eea4b59c9b756fcca716418b38411df0769c6088a2b78d0d41b7a86f` | `a5ebff1cd7a715df9f71fcf55f900e4f2f860d1e9a656112ed0d0921f7abd5fb` | 0 | yes | yes |
| `plugin-tooluniverse-peptide-target-deorphanization` | `18398885b023c543f7080459f926de364ad525092e2756ec5446b3d545209a7d` | `0185888f341904b45cd12a7163b78bed5031c6494ede811ac64c8729619ca307` | 3 | yes | yes |
| `plugin-tooluniverse-pharmacogenomics` | `0efa88304bffdbe1146cf20a307896cb21443bc230940ee2c57aa4d4d78b77ef` | `78ce1c7b90df3f76172f862e51bef6a9e640dbc3a8c1cec601e525c63d944aa2` | 0 | yes | yes |
| `plugin-tooluniverse-pharmacokinetics` | `005fcbeba81af34c3f44860cd83e5e233a05bd2d0997072a6f5d78ba4ed78433` | `a3fde7e72fe9f03e7f9a507abfa049c4b897a9004ba7cdc0139e5ca570c5b43a` | 1 | yes | yes |
| `plugin-tooluniverse-pharmacovigilance` | `1bd668a420f05d2ecdea064ad5c7592475f3f2d1b180e54f68eb0ba99f5cc924` | `115a6177465447fdb2b864b99432a6dc9055c351bf2b006782a0bc05f70ce22d` | 6 | yes | yes |
| `plugin-tooluniverse-phewas` | `0fc394a199e18dd07586b121c6e71d80ced7d6b8d36b05541c3073dfcaa6e6e5` | `8c6b41cd158afe25cc731afe643397ffe9a9f4e5284a1bc690736d42a4f57809` | 0 | yes | yes |
| `plugin-tooluniverse-phylogenetics` | `a499775333db925bd649b23214f7a76cd0856331f2ed3f4e4805e6be0cb233f1` | `8561268c3bae30bad22ef403d8d2fb3efce8a21fd9aa1dee038d340d32c23860` | 12 | yes | yes |
| `plugin-tooluniverse-plant-genomics` | `2e20de347c581dface066e48d07e955c7991c8cd0ff0b82aa5678a3230f12dac` | `acdceb480f49c9babfd4a97d1b147ca1bcef05b2df316cbc2b9097b28fbdb421` | 0 | yes | yes |
| `plugin-tooluniverse-polygenic-risk-score` | `8abe069870a94940aef39eb5980e606fc76e5acd3eff86f87fa0c2465f9f7e97` | `44d7c272c330c220981fc6794f90b9f94f7f3bbc73e2f9c2e0145ef53bc3d181` | 2 | yes | yes |
| `plugin-tooluniverse-population-genetics` | `f519850fc00c1759f3032246f34bef793e07c120fe2b04b7b0456cbfe52b2546` | `5e1c41dfbe8eb1f889b77396c0db6dd11887f82570139a0126e4e13ac224cc2e` | 1 | yes | yes |
| `plugin-tooluniverse-population-genetics-1000genomes` | `ba96882af77f1f5741d139a82509b0cc5803e11d1cd5434db6c88ebc12667687` | `b141ae118d0eac0a2b2f0781dcb3cae8b5c6a9cfa2054abb54d57f6fb85a0aaa` | 0 | yes | yes |
| `plugin-tooluniverse-precision-medicine-stratification` | `e9968d8d155037402dda81dbe3d6d9802e2b8f4f1e780310bef16c703b7b7178` | `7fa38d030a054fc8bf79d40fe6724bc974b03e440d8fe4eb05964e5f603f95a1` | 5 | yes | yes |
| `plugin-tooluniverse-precision-oncology` | `ae104edba9e36ce0eec2393cb25094fd10c401d0b0a9faf2d7ec0e37fc1c4d70` | `4514b4586b18a58e8a088d72f501b91f24154d85130920fa980d21ae16ca0572` | 7 | yes | yes |
| `plugin-tooluniverse-primer-design` | `d08cc5c9178e590a5393708a94f5b8467eaa20e972483a8de98bc4a168543195` | `d6931e13afb6e8b75e9cf2a8803e3a8a7e7b228bf623e6fb290ed10db4cb5819` | 1 | yes | yes |
| `plugin-tooluniverse-product-safety-surveillance` | `140d924d6b2b26b99bb1707d7307fbb85fa79d14c33f329eabf89a81f5c5721e` | `ca080a6b81908b6c2c311ae740acde030a90aa81a07560db112f30eae75deafa` | 1 | yes | yes |
| `plugin-tooluniverse-protein-interactions` | `4e4655a6220f5d698fa04aa9e86762ae2c7a0f8e2bce37fbdbe8b0ddba63ffa4` | `5eb5f3774446dc5f9ec0b7bada219e020a7e94d1a48d8c17a918a9ada5eacbf3` | 6 | yes | yes |
| `plugin-tooluniverse-protein-lof-mechanism` | `87e029c9348782cab3c752d705ac37f5818695c6545bdcbb7000387f17df7de0` | `1f615d4b44b8261789093d0bd26f635c1c3fcb116254e8d61e13da85a9cdde1f` | 0 | yes | yes |
| `plugin-tooluniverse-protein-modification-analysis` | `abe9611414d9faa6084fe4687418d21e16ed864404d3e562368ee61d5698faa1` | `c94ce710e206f69409bf4d06ef33b0a9d445945c00309d64a1d72b9dc394bdc7` | 0 | yes | yes |
| `plugin-tooluniverse-protein-sae-variant-interpretation` | `1eb22e8330b9f8575da265a205d8044c25561ea5c1eae825f19384a99f9902e9` | `9dd5952af0fd440e1b85eb37b257616efec12a9891f49abd7828f2d2f1e4d605` | 0 | yes | yes |
| `plugin-tooluniverse-protein-structural-annotation-pdb` | `9bc21650abd55bc98626a29ef8567baabe74234e5239d185a3743512b289ed87` | `f6d46b45049ec8de00f8c2291ccc601ccba697d2d22b1ea45368ecaaf566eec3` | 0 | yes | yes |
| `plugin-tooluniverse-protein-structure-prediction` | `1d1cb92cf09b56c813c68b9b0d86ec30045aaf9570fa4c35885b3cd89aedc5f0` | `c3cea2a40bc63d353fa8766b3415f1d7d8cae594a2f938dcf7d7230e82d95b5c` | 0 | yes | yes |
| `plugin-tooluniverse-protein-structure-retrieval` | `2584873265314e96a1615b6e6d8527b6b598fd65d02ab9c0c10e1885f314b6d8` | `d69571429be7b9d909e9a5b9f78b401c03ab55b6021a330397d6a5acdd1daecf` | 2 | yes | yes |
| `plugin-tooluniverse-protein-therapeutic-design` | `4dc5905f10c3048c2089640e699fdc512c9d2f8eafbed57b26acc8cc06b7293a` | `a3acd084cdb8171f7d34d917a891ce43d43c6a24854d8f2aae334f694abf9788` | 5 | yes | yes |
| `plugin-tooluniverse-proteomics-analysis` | `29a7b21df58b1c3e2f069a7de930bdae1d3761840d05b34503c85f176c1f6ff9` | `d66489b3519bfa252509cea833fc85f0b5f722b0122645d94d6511f4f76d4c42` | 3 | yes | yes |
| `plugin-tooluniverse-proteomics-data-retrieval` | `e4d16a915ab7250e59243b97aefa809aef99dfa823de8d600d78ee71d8d9e1b7` | `23c6059d494edb1a80570ccfd07452373f17e4c841fb628d6e00ec15e3d28c72` | 0 | yes | yes |
| `plugin-tooluniverse-rare-disease-diagnosis` | `0abbc3d92d7a8e99c240c79d58bf3b4b0236144756daec9878f171eb09d95b31` | `554838f0e320980aa3f9786a9fce1646aba363b1794f485c1210126284910120` | 6 | yes | yes |
| `plugin-tooluniverse-rare-disease-genomics` | `db96dda4b8ab52280f3b674ed740e9962ea74de3d6aaf9c8e71692e461681613` | `6ee4139fe3a8fe9deea449136dd5053eed63ed1d7ee078f4b8e711fc4f3bdca8` | 0 | yes | yes |
| `plugin-tooluniverse-regulatory-genomics` | `b44d75eabac56a22908a8fe860432bbd0379faeaaeab6f0a84fd567974be4022` | `2948137e251e547fd266f097e0f1fd774c244d722e875c5176ee26d33fab3e0e` | 0 | yes | yes |
| `plugin-tooluniverse-regulatory-variant-analysis` | `5eeab1c468e069983637d41ed593bddf7afcee9f73ca9c7e92d5c78d0795bc91` | `5085e08a1dfbcd0fa4e5ab477a02619794c6112b58adfee22c97de7743c36f26` | 0 | yes | yes |
| `plugin-tooluniverse-residue-functional-mechanism-interpretation` | `b80916d325a35ff15112b67e938d1061acd772c0f3fa07863aab064ec17fc60b` | `bf4926da8eb0d2bf073e756d4eb65771d2166bae2b954559593d20751d665520` | 1 | yes | yes |
| `plugin-tooluniverse-rnaseq-deseq2` | `550a07ede0c4ff2d224f90eb8357f4bf34a755e76271110031022047fc6e3873` | `f407764985ea677d19559582566067210bc6dbc934843a6c60f6d79521def567` | 20 | yes | yes |
| `plugin-tooluniverse-sequence-analysis` | `d9cdd03bdff77149c037eff9f2059a9bc03be8f424c15228e52aac20e01ae938` | `5dbb013c68adadee25cc23dde61d6b7fb530b043bf124bcd3639e20ed30fffc6` | 4 | yes | yes |
| `plugin-tooluniverse-sequence-retrieval` | `75e6863a4d0ee11de68d193c3fc88f84f32796a7de603b0bd134f316dd22707a` | `109db966f9aee0a16c2ff5479f1b0365b75061a2407ae99dd522015f3f300d3f` | 2 | yes | yes |
| `plugin-tooluniverse-single-cell` | `f8f7d08f81bfcd9756b27884ee06891150cfb028cfce882f0be58bdcb41c195a` | `9347f4e6555e75df2b30837d5a85b53b1161f969fb7c0b38a3904f4263dc0836` | 13 | yes | yes |
| `plugin-tooluniverse-small-molecule-discovery` | `2154959d4a0b64020b23f514a61f1c2c9259f14e1a91b4a2a2466897e0f72b61` | `58f1dfd741a6ff6d9a1aefb11d6c7661c4aed7667fa722d6146450d70437defe` | 0 | yes | yes |
| `plugin-tooluniverse-spatial-omics-analysis` | `9b793671ed0ce98f553c838a9370518f4f5d90d2cf1a91fee9dbd4df0ad44cfd` | `5ea136c1b3dd4fd1e2acb0f736dc8b578f943761e35320f02edf455f7961860d` | 4 | yes | yes |
| `plugin-tooluniverse-spatial-transcriptomics` | `f4a0f8321ed1c5d10bf465fa1cc8bff96107b2b1792bf09c581b8f49b8da3ef9` | `19ddc28d043c518b7b977852f7fd62b24d358ba9a3d262fe81289ea876f5754c` | 2 | yes | yes |
| `plugin-tooluniverse-statistical-modeling` | `d3312ec3c4c5b0944876eb9f14899fc121fdefc17463a1aa7d004eb2c8a27ac5` | `ff3f9a8e1edc0f82e224e2b59c3a5f877de9709c36460bc22b3904a0d0fc51b0` | 21 | yes | yes |
| `plugin-tooluniverse-stem-cell-organoid` | `f4981f6181a426bd52893d9a1abd7d4d61d7d0cbb3c8ec14fdbfa32da78d777d` | `30da1abb5b80c774aa6a7d174b9cc6b4a3988f6bb2a3da0d581fd9aff9b5bd27` | 0 | yes | yes |
| `plugin-tooluniverse-structural-proteomics` | `7c3d986ba03499f2103a2832ed9c95084a9f790140b04b0c1cace45fa8353d79` | `19c0173af654b12e26bfe6443d7c168026fcf70ed5f4d6271da264a6539f3391` | 0 | yes | yes |
| `plugin-tooluniverse-structural-variant-analysis` | `3992268d824933fd68ac35078539cfb71a0a166072c7475d498a48af4e0d2a91` | `f8c573ee46084f0682523b6a4a0a54581d519505d795275875654b85e412b7f7` | 4 | yes | yes |
| `plugin-tooluniverse-systems-biology` | `1a77c2f912145a554dab7676057f1c324ed159529f66cc72124f5c8629281d1e` | `a9690dbf3f197865a414d2ba13e728aecd42e2e6f9cfd2cc601d13081f6076a0` | 5 | yes | yes |
| `plugin-tooluniverse-target-research` | `e58ce1fe59ccb7d3afd2b49e2a8b9c9fca3a946847c851cbd6ab420cbe7dbc67` | `d065a63ca8fc6200b03681298581f0ded9583cf39dc37f6475b71de8fa29b9ac` | 5 | yes | yes |
| `plugin-tooluniverse-toxicology` | `6427c6b56f3cc84db5f6a773dc558dda192ceb3b1cef7abc21a42195bf9a96a8` | `f124f3fb0772eaf3152fba3ab21950ccd2277a0a72ad4a4bcf136609d832e5b7` | 0 | yes | yes |
| `plugin-tooluniverse-vaccine-design` | `0a94487e30e83c1279465d64979a5bb0a341bc3ac4d3e0b886d5e13372f6002c` | `615477f940158241547bbde6318593c637856d500c4fa980e22b19b060b39337` | 1 | yes | yes |
| `plugin-tooluniverse-variant-analysis` | `a38bb8facb16d2f15c590601ceb6063e6319bf5a5285ad124ac3f6fa80182f31` | `156f48f7c57f8cc4af73290fa6f686820263cbc3e7fcc023781ab5a5d879067f` | 14 | yes | yes |
| `plugin-tooluniverse-variant-functional-annotation` | `34a345bdb20d3b8059b1c6056e8d8c720246505564fc532d8e2e9a2eee72a6ff` | `205e2f8ef6e2a3b98150875c0132b13bd4f3b98be4a75bf49efadb80d87dc81a` | 0 | yes | yes |
| `plugin-tooluniverse-variant-interpretation` | `773be7540eb8300b68aed00bfd57b99079fc6333b987f1934084894a8c7781e1` | `456a72fbef19327e5b4df8abd09cdff40dddf3b8131290d6efe5cdc4240d9aa4` | 5 | yes | yes |
| `plugin-tooluniverse-variant-predictor-dms-validation` | `9784c45c13465d69dd7a712202e9c432ae96eb7c06778d1d16576152c419514a` | `e80de8bdc7aede90a595d502921f5d4d6159a4b4a133d463322a62fbbf104a00` | 0 | yes | yes |
| `plugin-tooluniverse-variant-to-mechanism` | `b4393652137947e68dd72a37c8ba69f802fa8bf26379489105ce44292b55038a` | `ad02849d269ccd9426860e43247524568f688cb9bcd8b3805e9246e9a904e17d` | 0 | yes | yes |

## Machine Review Artifact

| artifact | path | sha256 |
|---|---|---|
| extension review | `audits/tooluniverse/v1.5.10-6b50abe/artifacts/extension-review.json` | `64a97e17f348a5f6ce0a4de0e6b3c2f085a372cf7f8764d9c187a853e586671a` |

## Static Review

- 逐能力语义义务及权限边界由 Agent 审阅，见 `05-semantic-review.md`；机器输出不建立人类确认。
- [x] 命名、registry、审计记录、锚点 manifest 身份一致。
- [x] Agent 语义审阅见 `05-semantic-review.md`。
