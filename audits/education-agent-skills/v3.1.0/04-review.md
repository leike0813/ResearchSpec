# Education Agent Skills Extension Anchor Review — v3.1.0

## Registry And Domain Review

- capability entries: 136
- profile entries: 136
- Education Agent Skills 领域分配由 `src/plugins/domain-catalog.json` 自动镜像
- 每个领域只包含其 reviewed raw Skills 对应 extension
- extension capability IDs 与 raw Skill IDs 不冲突；与 bundled capabilities 不冲突。

## Package Review

| capability_id | package tree SHA-256 | profile SHA-256 | tool files | tools byte-identical | required fields bound |
|---|---|---|---|---|---|
| `plugin-education-agent-skills-academic-language-sentence-frame-generator` | `d744d44caf5580d14ff9ddb6044c5553cb67a3826590a3b5d4c461aad1646f39` | `4a2273c56fcd9d466eea52ad8fd2f4431c708592b4b45ee9b522e4ee6b1ce25c` | 0 | yes | yes |
| `plugin-education-agent-skills-adaptive-hint-sequence-designer` | `83a41ca58e9a72c5253b9ad420b8db0b99af994f491967a7a755c919e54d6dbe` | `a93feca2e1e53f6fd68d3518c170599d133b0c6d9a3ec520a4ef339715fbc65a` | 0 | yes | yes |
| `plugin-education-agent-skills-agency-circles-for-systems-action` | `fe3d762698b03fbce33fdf503177df1c31ebe46780363c9366e3704ff8738b7d` | `46c11ff29dc6ba22b73b12c925a44ed231813b70506d34cd2c60826538defdd1` | 0 | yes | yes |
| `plugin-education-agent-skills-agency-scaffold-generator` | `82888f185d2bdefcfabeebeed17bded0c4ab3e2fcd2eca3007eebd02a678dcf1` | `572864532c129dc8b9518bb312b7e7268e7f2a70601afd816723e5446b679678` | 0 | yes | yes |
| `plugin-education-agent-skills-ai-claim-checker` | `35881ef598ec00e521b5e38b7fe9ea62b1fbee9d0605c98e91afe29821465511` | `8d2034401f7d802a2dfba6ce8d78c8535839af02d6da6048af2877a1b8e46719` | 0 | yes | yes |
| `plugin-education-agent-skills-ai-expertise-interrogation-designer` | `a25a21dc51edf4ab5c9e1774ec79f84ae4caf2b78bd7e13d8425d9eededf6fd2` | `fcaf7afaa7d6568c7eb9227b82609be0555046a3337a40e1b3a984fb4c35cdf2` | 0 | yes | yes |
| `plugin-education-agent-skills-ai-facilitated-collaborative-learning-designer` | `39ec5e477115c2ba7a3828f959643a1c87420c676b86a42e8059ee655f2ca874` | `39a5e403582fd838dffd55bc510c5eb39249a089f9753be087967a6de5bf8b10` | 0 | yes | yes |
| `plugin-education-agent-skills-ai-feedback-design-principles` | `d330ae41907163b2380a417ea49cb9be36884ba36c10dfd2129fdfcdca7f10a4` | `108c4c9e90a04d47236c384e1ac36824b62e8e7a75645a5ff98f9a807255dc39` | 0 | yes | yes |
| `plugin-education-agent-skills-ai-hallucination-fact-check-protocol` | `611eef56d2b4c750caa6293ee72a093686adacab0bcf7470235fe84321956409` | `dcf23ad9b6e71bacc2f485a74bd9c4ae2d3ae40ddf2f675b0ca6add154555720` | 0 | yes | yes |
| `plugin-education-agent-skills-ai-learning-boundary-mapper` | `b7fac52d3f4f4b75e773cc89e060aeb6163d7f3b19949dcb00440c3d24222623` | `4bc479f451c91f1cc0fd5c0827274fb1d8e8f421b1c2b323f4a826745c534ca0` | 0 | yes | yes |
| `plugin-education-agent-skills-ai-output-critical-audit-designer` | `d84badaf380d7a27d2047f54fbff877230baed0729ef409390374e697f52fabe` | `c479b4f7b73f12c0f56cd1e3dc1d2b499689db9b30bf84781623879d4e3ba162` | 0 | yes | yes |
| `plugin-education-agent-skills-ai-socratic-dialogue-designer` | `06692f18a14590f333cc3d2f5a5e7d7bb51c6d471f79e8e547167ccd56252049` | `87596135c134939e3c5dd11af6ad39a303c9db47dbe078a759a0464fd832bb78` | 0 | yes | yes |
| `plugin-education-agent-skills-argument-structure-scaffold-generator` | `da6b61639129c5f18da69b7e1e276ce2af98a2be84afe5e26875ce020efff441` | `b6b9738931c9a8b417c9dd20ab401133089d4b2b0ba95c00f9a4beaeb086a57f` | 0 | yes | yes |
| `plugin-education-agent-skills-aspirational-systems-iceberg` | `5927b6a029abc67fb482c4de0e160c80c16417597cc41cdc3cc0d05ccffd4fcc` | `b5671e16d0b41ebe31c441136376214ecfa2cd7218c098644f1d33c98411e9eb` | 0 | yes | yes |
| `plugin-education-agent-skills-assessment-validity-checker` | `7c909da10d16f68e457432c739c15f467f1f1c8f31be31f3e6d7461bba05e249` | `5692c4ed720b70cdaf861e67bd6a5a9bc3630b2c9a3c08311e7b0c16a4b51fc5` | 0 | yes | yes |
| `plugin-education-agent-skills-awe-wonder-experience-designer` | `8a3aecb812cafab28896f30ffc66e46f33f3a1984e0a23a9451ba51153c55dd0` | `8dadfea5bf54f2aef1d63fc46854bcc02fc4535920e7b18207f42ad7197b0617` | 0 | yes | yes |
| `plugin-education-agent-skills-backwards-design-unit-planner` | `d8496fdb192633c2e01df627173f891ac2af9aaf9c64a829bf3eeda252c83f2c` | `7eb9597dab22c57fe58c8711022682046786c0ad65f5640a28d204dfc93f5b4c` | 0 | yes | yes |
| `plugin-education-agent-skills-belonging-classroom-culture-designer` | `51ed064c4050a09a47fa7d0671be90384d3a6f6b51d10554cef7839cafc2891f` | `736766a70925348faa4d3b98be1d281707201a5c50bd72be4d7b8d3b6bb0a84c` | 0 | yes | yes |
| `plugin-education-agent-skills-biophilic-learning-environment-designer` | `d7403fe04e7e368ad637427bb5d94c6aada492bc8afc25205de7a0ff96a4d903` | `f00d3302ef4335695e2d1ceb8feba8818f7705fb779734b652d7f6dab5d24d20` | 0 | yes | yes |
| `plugin-education-agent-skills-checking-for-understanding-protocol-designer` | `52d51e9f2db340eba7c5ddffd9c84a96d2e1b170dcfa4c952f2c9fa0a7c50172` | `6c80a8b7746af756f05068dc37cd26e474dff85caf19a860080592c9c1fedc13` | 0 | yes | yes |
| `plugin-education-agent-skills-cognitive-load-analyser` | `324e2175714c6d90f45eec8584cf9814fc9374b012b67137be6d9832451eecb7` | `ba31e0f19556d018b99343329d98b933827ad0dba7d3567ae9d2876347b4b72e` | 0 | yes | yes |
| `plugin-education-agent-skills-cognitive-tutoring-architecture-designer` | `0d01f7a67c3d1bb58dbc128cd909b6166f7a5be0e8921507d7c7cd41ffaf9b42` | `9db6201c76e7abd7a039125baba18c3ba979565b6b6a1f4bddb4e9b196bc9076` | 0 | yes | yes |
| `plugin-education-agent-skills-competency-unpacker` | `02f7157f1995fd906b44038d700aa3777fcb96f54fe4e872e78bcacaffd24d71` | `f534ec9ae3a994e646f5f1d5ce0cf759437444ce0cae0c089d6da7ed31c15c75` | 0 | yes | yes |
| `plugin-education-agent-skills-confidence-calibration-check` | `6319b1cc8fb1ad5a81bbc79575797b87d524d3b8bf324e66a984a2a49385500c` | `1db11bdf9c71a743f5f499f85b10fcf2fdfce7a573f9b8987d2042b1958d304c` | 0 | yes | yes |
| `plugin-education-agent-skills-coverage-audit` | `08449f88353a85124ffe2dc6caf2b27d78c6180639b8ede6cbee137ac8638a47` | `f126f37b674883aa23e1ff2be2fd340af385fc15bc8c771e3c921c42b543e0fa` | 0 | yes | yes |
| `plugin-education-agent-skills-cpa-sequence-designer` | `ae27bc81c6d807eac97d187be521794464a50c28f236d5b3e3774eaea917a783` | `d990092c7280d8ba73928dda1d0b5b08b1d22503e70e4872c6947116a263b5cd` | 0 | yes | yes |
| `plugin-education-agent-skills-criterion-referenced-rubric-generator` | `392002751198aa2c6c8510e99170176f11af2f23f0ad5c2795a6497fc9444199` | `08489e87a7c4149e2de7c35bfc0750137089855e9f1ea7feff662ec1aa32d78f` | 0 | yes | yes |
| `plugin-education-agent-skills-critical-thinking-task-designer` | `8bd604b7bd68cf8669e20848a4d32ed0923ec8a00bd769b3073bd4e3a52d777f` | `1a92327c7027300f3677eb5048bf4119caf1e1dabd7a100ea568062d45a73c68` | 0 | yes | yes |
| `plugin-education-agent-skills-cross-cultural-task-validity-checker` | `d12fd521a4e23ded15d503408672906f62df706e1fa108754d26e0ba843ad6df` | `bdee451c2cf3ca325d67d0d878ee56f297bb347ac320e77ad44a2ab217b60448` | 0 | yes | yes |
| `plugin-education-agent-skills-culturally-responsive-teaching-designer` | `e41d0be5cfef7ff7b61f4ff61cb8aeafe2b83b8476f29c79b8715d65341b86fe` | `86dc5333c0ad74ec52d2ff6d11676f66ffbf041c0ed864349426d13b4dca901c` | 0 | yes | yes |
| `plugin-education-agent-skills-curriculum-crosswalk` | `91420e41907d33911564af212c67bad4c1eceb659152b0cc03d90613a5845949` | `63c5bd2974ad374756a23b3bf6febe25c1898f9f08e95d33ab06b5cbe0436bd4` | 0 | yes | yes |
| `plugin-education-agent-skills-curriculum-knowledge-architecture-designer` | `6e2a06583756c78493c9a737582d7760a9c3273ff29439184afc3975c1ab299b` | `d71b62ed4d2fcf49d3b3901858804480c7b89a13d1b6c2f09a52d9338e2a207b` | 1 | yes | yes |
| `plugin-education-agent-skills-dialogic-teaching-move-generator` | `22b9c35f151a1f8ff2b6447a7d1295a5760682a8ed190a609184ba460653b870` | `b2a80b3177693afc6ef645185209ca4012794b0f512b890979256d679c504cd6` | 0 | yes | yes |
| `plugin-education-agent-skills-differentiation-adapter` | `5730e1ea39df27af7f026789ec066713a1e9d5443708e62e946e0e8511ed0c0d` | `dde09101bc59144aebbe26d71f1ce6ae796e2700998c5e97d3caa67f53a40101` | 0 | yes | yes |
| `plugin-education-agent-skills-digital-worked-example-sequence` | `fad4d397ab8e90f7cc08cf6ed52da1f0a16d74f0bd405eddce4f08baed057231` | `f7747f1a2b826d6e5a7c25fccf1adf83c939e93477d95f0f1ce4442033a9192a` | 0 | yes | yes |
| `plugin-education-agent-skills-disciplinary-ai-literacy-sequence-designer` | `68c39b6f75da489767d3f5dac3c94f22f711fb6ab18cbea8234caf95db199140` | `ff0cc4edf71914f17a189c381c274d6894a799f518cf810b7bd9d2af2617293e` | 0 | yes | yes |
| `plugin-education-agent-skills-disciplinary-writing-scaffold` | `5930d5ea61a984dcf198ecc0b7e35899be7f0b800e98bb5e146c2fae961b7ac7` | `6182b358dd680c573352af99b5591254b93a26ef3742ec80d903d630966d29da` | 0 | yes | yes |
| `plugin-education-agent-skills-discipline-specific-critical-thinking-task-designer` | `0fb75db771850b4bd3edba10389171c571a9efa0750002e35cf43f6ffe5fae24` | `bd65e5f83161218c55643dd4534c8082cf255765790f1ea737f5f4a7f16196ab` | 0 | yes | yes |
| `plugin-education-agent-skills-discussion-protocol-selector` | `dc6bd1517bc78586fdd015aa9fc74a51ace66d5e0264cfc98851ecec7a24288a` | `53c3a326c8427cde565941d39ae84efbb4978ffbb838850a3030586256911567` | 0 | yes | yes |
| `plugin-education-agent-skills-dual-coding-designer` | `4c9f0c108d461474e2734040c331d77d1dda38a6a5242aa149b738a3656b0741` | `a6763096c3fdfff68d0395d43e618be3dfed88dd964c90112989bb6c0bf9488d` | 0 | yes | yes |
| `plugin-education-agent-skills-ecological-inquiry-anchor-designer` | `45d416184e01f9290650b26da0179b3de8d8252e82ea8a3036015bdf68abfcd7` | `7c70522d80553a15371617b86a6eb91ccded0fa27075a3a09f727272f27744aa` | 0 | yes | yes |
| `plugin-education-agent-skills-elaborative-interrogation-generator` | `2477fabd1b5326bf4b5d24b632f55217b6185175ca883f1a92a61146dc9b43a8` | `0844c3576eddb012900a25aed4f3f1a826d70c3010606ce2ee47265ad7679844` | 0 | yes | yes |
| `plugin-education-agent-skills-emergent-project-design-scaffold` | `fea84b5138352a186dcc51651df14544cfebab1e0e062023e7ac9f6a999911a3` | `27a90ce89781e18736db07afe6f94dad03a08c6fb26cb4ca5c1a501c9bdee1cb` | 0 | yes | yes |
| `plugin-education-agent-skills-erroneous-example-designer` | `b54015fca29b4afce72d9b29f1f92472016fd0f619188e53179a3f947c796491` | `f11abb16206f25ce67d857cd1de4c57665d4bd0348cecdd3dee9a67912913fe4` | 0 | yes | yes |
| `plugin-education-agent-skills-error-analysis-protocol` | `b4824a8df66a0363a14da23b99083f4aa0cdea599111c3f622095b5352ef4e33` | `122eccd2e9ef31ecfd4aec80a87e37b4feeccb84447e2d42e04a268e272e8fa6` | 0 | yes | yes |
| `plugin-education-agent-skills-experiential-learning-cycle-designer` | `eedc73f3d7d617d7e2e6d548d120434c574021a0ca18cd5db03e72fa74c220a3` | `5d6cbd065c10c92763670bc823041e426e67ebe29e8c71abd0a76dbe8b5189fe` | 0 | yes | yes |
| `plugin-education-agent-skills-explain-first-interrogator` | `ee5db896ea39c916bdc4ea1ba8124f7339c00254b2999f342b601defdd771f08` | `b4390377fe486821de32b1068da632470d2b8bb06c823fdff4ee16564519a5fd` | 0 | yes | yes |
| `plugin-education-agent-skills-explicit-instruction-sequence-builder` | `717e0eb4196db45161fba01f6069643a2bafe333d88a15911ffec35319ffa696` | `a6ac4c3d8a605eb7b4bf9e5f1979a978e7b9343dbb43761482e35492580c7ca6` | 0 | yes | yes |
| `plugin-education-agent-skills-fading-manager` | `012bbb3dc8c5bf96cbd7bc7b4005e0e816243dd245aad95b0f09fe40d820e24f` | `484ced876af3577bf79d58721c20ccf7265ef31da6f9b90effc449bb1a86cab1` | 0 | yes | yes |
| `plugin-education-agent-skills-feedback-quality-analyser` | `a28532f35150a4e6e54f404c3c6e093bc7080d0c0b43b451904488b9ca9579f9` | `a3c098ab1153c1cecb6dddbeefd18ce22d8185fbd2b8c682acc19d65af56f4ce` | 0 | yes | yes |
| `plugin-education-agent-skills-flow-state-condition-designer` | `f57b7aece24541a002cab5d7d44aed9d9c1732c089078b84800910fe7e176946` | `1fc0d8cc632a3adc622bcc28a6afaf00a73dcc6ed4ca9e9e5d8472b933fc187d` | 0 | yes | yes |
| `plugin-education-agent-skills-formative-assessment-loop-designer` | `ff2ed233799c01b5a56f3ba0cd81bf2d546a026eb7162ab16c8b476998b60514` | `6497bd1a5223332670480fba1fa8344a9353921babe6cce6c7aa1446a16164b4` | 0 | yes | yes |
| `plugin-education-agent-skills-formative-assessment-technique-selector` | `c1633b3d9950db7eb5222d7d8c1f71293296c3c58d37a3ecc95a073efde2a178` | `2c2c20341f262ca2ca3e4c30f31b3af32fafd9ad62b4906b2f56210a741dc40c` | 0 | yes | yes |
| `plugin-education-agent-skills-gap-analysis-from-student-work` | `ac36ce1ae4ced279a9feb4d11abe0ef56b44f2d040bc1eef5ff51e48e8b4eb6b` | `6022a656cf6b58ae2d8d2070991442d6f58bdf8772faded8fb92f70b1a919f9f` | 0 | yes | yes |
| `plugin-education-agent-skills-goal-setting-protocol-designer` | `5ceb1e1bfafca5e46fedcf30b862595b4c6782486ea1ae31b3734cebd0534555` | `4e39d86e52ded5cd04fbe48c1ffff05baf6901f1f02095790d0f31dada3ed64c` | 0 | yes | yes |
| `plugin-education-agent-skills-hexagon-complexity-mapper` | `7e9f29660721ca8a617b92a0d90a89fafb371694902540705b1edf0099735035` | `7599b6628ee363d5e8afca9ab7613b75ff16dfa15c8a629e279b94a6f0eab20f` | 0 | yes | yes |
| `plugin-education-agent-skills-hinge-question-designer` | `79e6834915d2f6179720735862bada926b944cce197d5fa4eb80109990a293cf` | `50024aa5fa60cc706c4041bbef2f9f303b3a9adc24d41509c7686e892622d384` | 0 | yes | yes |
| `plugin-education-agent-skills-implementation-intention-designer` | `1608fa89841975d5c2a8e2c3a39a8f180b4762d8d2f06281e5b896420a3d01a8` | `0a6643ab4fd1c681a24a1334ebca1bea2d2c4d6b3d1665051eca8cfa691a7e3d` | 0 | yes | yes |
| `plugin-education-agent-skills-individual-spacing-algorithm-explainer` | `97ddc6459c9c7f8fe45a73879927d2291176333f21358cc668eaa4f986d7ffd6` | `b7ac51f4ecac3d71dff202a5fb910ed0dad770cdee3cd313db31bf6f34661ea7` | 0 | yes | yes |
| `plugin-education-agent-skills-instructional-coaching-conversation-guide` | `34b6ac3d926d4739c798fd3820091cf559e896b6ba61d62d24f365e664f4213b` | `4ded094c8318b076604bb03703830b04eef85331221344e48f743a82417bad52` | 0 | yes | yes |
| `plugin-education-agent-skills-intelligent-tutoring-dialogue-designer` | `a0a4ce1b2314c22ca58c7e7e444201cac8f77fc1a46529a02fc01f91ac8cd8a7` | `f16d274e1ea9e0ea03489f50a67db5d78ba72f0b7c8d9c92bf29b19769908ecc` | 0 | yes | yes |
| `plugin-education-agent-skills-interdisciplinary-real-world-connection-mapper` | `3c20d44360ebadca787ba364f3025b53d3d8b462d2df9d3c16990592a969e2b1` | `1208e1f681600a3f502621f65bccf14098030b66651707c209790b0390f65ff9` | 0 | yes | yes |
| `plugin-education-agent-skills-interleaving-unit-planner` | `de36ab334902431ec8200f5504dfe06c6ca3b437ceafb61dc2e0d07fe633c630` | `6d326022e11f7fe9f67e3def040a3af0ade1226ee2f3e3d32c81c8bfd020fa54` | 0 | yes | yes |
| `plugin-education-agent-skills-kud-chart-author` | `6dce49a248f63a052ffad52dab941c3bd43202443979eba9a6ab9202a1f503f1` | `da9f9005135326fae612b1608b2c23861d3e83c878010d7c0f3a2d0d3f19f6d3` | 0 | yes | yes |
| `plugin-education-agent-skills-kud-knowledge-type-mapper` | `6b0cbfcc0a35faa95bb1d149c44ea93dccc1e476d85f63b209acd2a03c5b19eb` | `48657433a81ea066984ffeeb425f9d765853eb4e096b1401fb5e6a1df4b46c8b` | 1 | yes | yes |
| `plugin-education-agent-skills-ladder-of-inference-reflection` | `01c3b3cc134e2165d78d6cf9a08b4762a63c846f607f53e017c684a6f57018bd` | `2f06ee17e539b038033ee9ddc2ee13d344c06392af04d5f5e5a12c30d8c50999` | 0 | yes | yes |
| `plugin-education-agent-skills-language-demand-analyser` | `52599d29c20a614050b51fe4160f7a62ccf3c5dd0e9ad6752d7b17d61ee61eaf` | `163ae447eab233846b0dd8a43803e8f8318d91b4c88a261c5683f6b621563d41` | 0 | yes | yes |
| `plugin-education-agent-skills-learning-analytics-interpretation-guide` | `1b12fd0847a81ffe1d7146dcd2f18fd15762c990cb9e8090ac65590039703490` | `a7185020553e598771bf9887a2b4a21beec02f1cdebf227d8cf148600b0bdd4e` | 0 | yes | yes |
| `plugin-education-agent-skills-learning-progression-builder` | `a343191331926f656270a11f57a1a5001beb7dc2ec1926fb805f4277491276e8` | `833e54b04b88c231131ba0c1742bed60e5b74c52f48de26d9d758cdb657cbce7` | 0 | yes | yes |
| `plugin-education-agent-skills-lesson-observation-protocol-designer` | `210e2d15141bbd253a64e6c31c2a69962141f7353549130b56ca7e0284a24175` | `28f296463c577cb49524a9d21e94957c87e27cb589fd482589ae084a277f08a8` | 0 | yes | yes |
| `plugin-education-agent-skills-lesson-opening-designer` | `43c1a70c0cc852ac89a2b0790459282bbf6bcf73ed0f1d45bbf01570ae4348c4` | `d1b99fa2c811eac4835c3c342538b7bd7df8bcd1bddf7a9042a86e4c53856907` | 0 | yes | yes |
| `plugin-education-agent-skills-lesson-study-cycle-designer` | `b7ca8b4e753c4c1b3272fc0a02febff39e87f7fc1f796c759c0a4e62e5835491` | `589f668cd8887bf4919ff3fd37b3d9142e0ac6b5e29d78e4598081a9931307e0` | 0 | yes | yes |
| `plugin-education-agent-skills-leverage-and-response-design` | `4b7c199786de93319e14a57537d63aa3fb98e63dfc950f87d1d4ca2e4c739a5d` | `ce717d042db1cd8183292bbecd4e06b0c7b8813cc3b07b5be0aa19d1b71b0ee6` | 0 | yes | yes |
| `plugin-education-agent-skills-media-literacy-deconstruction-protocol` | `4311ef9d7e407dd4c1f15c4cdfa2a518c3dbf08f5eca7e4effa5479aaa899822` | `b4b32491f222c8602f676a937d4d5051461ce000681eaf9ac70b28540d2eea1a` | 0 | yes | yes |
| `plugin-education-agent-skills-mental-model-mapper` | `0769c02deec7100b7d151fde2f289c6e04e58966a246f89072c173d29bd94c55` | `ff6199882086767fabc38dd4adb859e9cad36bc1283b28d1c5e356b72aba445a` | 0 | yes | yes |
| `plugin-education-agent-skills-metacognitive-monitoring-ai-contexts` | `1df6a98ece338c0a975c1018de71e5d1e2c886c9c246af904aeda9c6c8f8e9d8` | `b991be80c18d28d9500166df00abd89ee0638449cda89cae5a1455df9182e6fa` | 0 | yes | yes |
| `plugin-education-agent-skills-metacognitive-prompt-library` | `78fea211dbf0da2c53e4bb8fc116434d1f1d635347fdd8d9deb23593e8277c7c` | `31b1e484c6c8b610e7c08b5400aa7533bf608ebe5860dce1d7786acc2053f49c` | 0 | yes | yes |
| `plugin-education-agent-skills-mixed-age-learning-task-designer` | `e4633c033d57e33a60703af7f033eb4f95e6720de8ada2ef36b8f2159b24694c` | `77ae8a9ed74b56aa2476de87984c9077ded4bc5d62e90795b328c0454a091126` | 0 | yes | yes |
| `plugin-education-agent-skills-motivation-diagnostic-task-redesign` | `6949bfaa1e9779c3a77a79d36e775901c266f558d7d3dad19f6e731209f6c7c7` | `797fb8a9ada03491a6c13f68cc1923835c4d76d509abed987cb3d8f25cffaaf3` | 0 | yes | yes |
| `plugin-education-agent-skills-outdoor-learning-sequence-designer` | `5bbce7eacc4d888c970a7a9e0b871d92a76f496a19bec464c921c6bcd4798cfc` | `7e59cd99680ab35fb75c75c90514ac3057adda3179a42d51f77e08fa9e4e6811` | 0 | yes | yes |
| `plugin-education-agent-skills-panel-review` | `6d0dfb4b017dd5e4b16b6b373dfc76d283d1aafa3242fd086b792ec12869c2d8` | `f78c38d4385fd404c5fa9b7d4638d44ebac09d284fe31c2e772d1ef109bcdcc8` | 1 | yes | yes |
| `plugin-education-agent-skills-pedagogical-content-knowledge-developer` | `dddde21bbf5e104842416bada9ac72907aff67a55b989df843d66ae1b04dc666` | `087e96799fc4f84cf54fd31206a114ce8dbb70f34b4653ca3be7567a003064b9` | 1 | yes | yes |
| `plugin-education-agent-skills-perma-based-lesson-designer` | `1db4ed38c2ab65b139e5243cb95099aec665a5cfdc2e77830f690060f431fff8` | `97abdd0467c1e77f7aa2062e69ab2720e18a4a0d83c4b9bd89834461f7070c4a` | 0 | yes | yes |
| `plugin-education-agent-skills-perspective-taking-designer` | `bacb6d7728fb32ccf8930bfacce8c6fe0efa636dbbbbaae8636c5a9f61a0d06f` | `e3a4d7d9e56ce50fe3900343b9784833b1f43a720dbee0c33c5d1c158b8c7543` | 0 | yes | yes |
| `plugin-education-agent-skills-phenomenon-based-unit-anchor` | `b5e7e2fae8b1d099e4f37e49b5b61b799baf35977b250f676d45ac361ce43bed` | `e4408df15be10c63ae01d655419257676b30339050c4c91d6a9f7c81579e30c1` | 0 | yes | yes |
| `plugin-education-agent-skills-place-based-inquiry-anchor` | `8017a6faf5edbafceda14488bcc618e6a3e993089d473ffa10adfeb5f780e573` | `3bd9367e98f6b5b60f81ff9d918e8739fa6c7a6ee93ffa413e12bae1fa58fbb8` | 0 | yes | yes |
| `plugin-education-agent-skills-practice-problem-sequence-designer` | `645ecd8ee0b756cbaf348048f8e5a86e75f1d2bfba91c823ba400e09fd5e474b` | `12800623ce58778f6d53251f1a1f0e29416b08d67564391f84bf5b5091d4325f` | 0 | yes | yes |
| `plugin-education-agent-skills-prepared-environment-designer` | `44958d518cb534dd6f8427ca7e369fe40e58f1bf4097ae047c467954e32594d0` | `8cd8418710f37f84e2130304b39c91f0e7b55456d8ee66c5e3bf6ada1d4f1d6d` | 0 | yes | yes |
| `plugin-education-agent-skills-productive-failure-desirable-difficulty-designer` | `9cfcb046d404390c86680f1a559960e11ecbb2f6618a04b0e893e9bded88a3b2` | `6b972f2571e18f779e49c8c30b05b187532a1202740af8331302296829e7ddfb` | 0 | yes | yes |
| `plugin-education-agent-skills-productive-failure-protocol` | `461de47edd57a954bbc874ad40cb33b30de0556123e01a09e55adfa31d453572` | `bd6f63f09cc7f7bc4e6e727147dff4a004754792a03def2c2676af83e711ea46` | 0 | yes | yes |
| `plugin-education-agent-skills-professional-development-session-designer` | `43c9ef13d29863c27aef845f5a8f75ff7ff0ebc279e50ad3b09609c4d0afd2eb` | `4b4a016956ece856038c2a3a001f1e8a52d21614117980d1ed3ebe14fefa9dbf` | 0 | yes | yes |
| `plugin-education-agent-skills-progressive-hint-ladder` | `a0c799d8f72e68a057077b938e5425d4f6d1fbecd7e4e4a7cfaf8d81ccabfdbe` | `494ead86e6722cf4ee09e7806d869144fc6287eb90062e140041404d7477879e` | 0 | yes | yes |
| `plugin-education-agent-skills-project-brief-designer` | `8f98a5471e1b91f5d65197910f22a374ff6e1501c956580ac743b796d349192e` | `ca00f57366e6c3cd592d56ab4733be85d5fc8a9ef758698b7d9fb81c3e30d1d7` | 0 | yes | yes |
| `plugin-education-agent-skills-prompt-literacy-sequence-designer` | `688c941a31a568daad48208afa938be1516980b9a6b56e6cca34cef92e13b5ec` | `b17f78b34c0b39e4f71ebe27f4cc93316b593f5f98b08e9353966003fd4b36b1` | 0 | yes | yes |
| `plugin-education-agent-skills-reading-comprehension-strategy-selector` | `555037587e675e58f0308475a12c991bf4dbba9062d9eec75c5579d4cb4ce9f7` | `add0b7eabba52684917888d294dd01184b2a01367349f5a3efb7b17890e04255` | 0 | yes | yes |
| `plugin-education-agent-skills-reflective-practice-prompt-generator` | `867dc35bcb10f72089b27b6a82503530a0331c27adf9305f2eab8e14edd1a988` | `e5638e2b6ca03c45440f0a980e87339c4dafd745c3f59b05b1f17db168779d1d` | 0 | yes | yes |
| `plugin-education-agent-skills-reggio-documentation-protocol` | `ae556e14cfdb744dba5123c18c4f75aa641d8db7493c58cf9d8b290e8d3924b9` | `adae98da37d64ac99182d030eb13e6367da5936e6ea0b8b41a0ef2a67cfb8ee5` | 0 | yes | yes |
| `plugin-education-agent-skills-restorative-practice-protocol-designer` | `984eafaaad9df3818b8a1594123a88d894a9ed1c2ab18efb8ebeceaa2278f599` | `1b435296752666a00297314abaa7f149be4bd1aa84d50490d403e3eadc798900` | 0 | yes | yes |
| `plugin-education-agent-skills-retrieval-practice-generator` | `d7ae6be4564dc9f2c0c86abc94d876cea34dbbe9fff18cb863f5d1ab59293280` | `d32193a43b81d5be344021ec65afdb1539550937b171faaafb0bdb3af885ab3d` | 0 | yes | yes |
| `plugin-education-agent-skills-retrieve-first-gate` | `8c64325a2800e966ac40193695912db186ea5b9ddd5994854636872264a42f02` | `93662ba8cc0021796460f4ab65c851b4fee4e7492fad791f1d132faf4de633d8` | 0 | yes | yes |
| `plugin-education-agent-skills-ruler-emotional-literacy-sequence` | `b4ffcf2e6a8cbac2be58d55dff2cb78a860777120f94d13413610d3b778accbf` | `ad58a406e3ef3608750d23de9c7d339419eb3075d41ec718d54ffd532583900e` | 0 | yes | yes |
| `plugin-education-agent-skills-scaffolded-task-modifier` | `24d0dedf1b17ed8e439b84e1ca0f77585b2d32934f0247f00556e0ad0197b0d0` | `52d012d2ea0390bc2a25add5612bf1a43edc26540e36bc6f17698b5f34111eaa` | 0 | yes | yes |
| `plugin-education-agent-skills-scope-and-sequence-designer` | `648a8343cbb6d51c5a152502bff57a79324a2bbf9096399b9868fd3e0f6184d9` | `c6f6a70e2973e949d9919ae384702558da2a92a6b2369b98f3e3bef89b3d321f` | 1 | yes | yes |
| `plugin-education-agent-skills-self-efficacy-builder-sequence` | `9e2458f2a76c9355e3eb249b705416977138857e2aa3bc0586647539748dc07f` | `cdd38da2ca535c0ca9806add3d91c62eac06ae8bc0fcd410c231d62e6be29f79` | 0 | yes | yes |
| `plugin-education-agent-skills-self-explanation-prompt-designer` | `f30a62083b99a43246ec97bcd4912dcee23c8574a4e0c5d997f79306182417c9` | `aff726b767e8c53be4e8a62fd877dcb02aa1f8f2b0bc87dab42c246195f6d39b` | 0 | yes | yes |
| `plugin-education-agent-skills-self-regulation-scaffold-generator` | `ec5a9bfa6baf9414fb428f6d840eb3660c268b95ee94be5ac4fc50fbaab9681f` | `89d2539b3d6df98b385a929e984058d7ebb704e3da7ea37d4ebb95ded7a9083a` | 0 | yes | yes |
| `plugin-education-agent-skills-service-learning-project-designer` | `1166f75d25b1c7afb849cd7913d78d82aad4c020fec7232e25ad9860cba1224b` | `06884b3be35d7fbd4f5e642d0adf94a36783d7b489330ba4f2862bd5b0b342cc` | 0 | yes | yes |
| `plugin-education-agent-skills-sheltered-instruction-lesson-modifier` | `a9656d8341095aed2a406b33eb492a661dba765be39712f08295e7e1f1d7271b` | `857f8e274b62f235af5e9e3bc5902264353b2ee1fa9d7f5fc5d3aa1d69b33740` | 0 | yes | yes |
| `plugin-education-agent-skills-socratic-questioning-sequence-generator` | `10fa37bbc1a5c53a36628b26b658966d80b7538b041391c89fabe69383169c21` | `24dfb2d443359536f075342772b94bd47ae547ac127d833b3376488ef1c068f8` | 0 | yes | yes |
| `plugin-education-agent-skills-source-credibility-evaluation-protocol` | `16d0b0a417b83ada6e91def90e74a60d0da4740f506f624e3d45f73711733d8d` | `960e228f838d5dd89259fd8fceaa99ced89c2c82031d2ac8383737c1031e00dd` | 0 | yes | yes |
| `plugin-education-agent-skills-spaced-practice-scheduler` | `98ff313eee5cf39fd34cb6b242fd146f0c38de48a6277e2f9af39dcab16bbc06` | `d28c6df8e987862d1c26d890df83acde39605e1f92a11834e9d7e2ba6869b285` | 0 | yes | yes |
| `plugin-education-agent-skills-srl-session-wrapper` | `19de9936d1dde44565b2b822e97b4e2991388f17d523a0381111de4e31968d0f` | `c357c9bd37ba1295b0e49c95a7bc4ddac612502b7cbb9bf4bd08b0875b25b988` | 0 | yes | yes |
| `plugin-education-agent-skills-stuck-and-error-diagnosis-coach` | `9310d57f11af7ba2652f48e1e20e12d62601154c169c825eae0a2744fed0c276` | `fc921575577f4dbb0ecaffab8bdf4683c8f86a849d0b988777a666074aaac121` | 0 | yes | yes |
| `plugin-education-agent-skills-study-strategy-selector` | `b7b321879044e0a8ebcafd0e6c9de0d7731b977fa109a69f8461682169aa2a3c` | `1a8e3a008327b3934790b2d9343f061778d5c94e24443645b44e4ff17be4bf9d` | 0 | yes | yes |
| `plugin-education-agent-skills-systems-awareness-iceberg` | `a73b3e5b4cbaec5788d90c00c6d5d9a926a59423894f6f8da97985eebc19e763` | `1587e2577299af2a3a19b87076246498ca85719efa1d517081babfffe0b65646` | 0 | yes | yes |
| `plugin-education-agent-skills-systems-wellbeing-impact-mapper` | `e9c941c64e5fdc423669f6a9cce2308d3a7a84f807ff67a00bc502859c649b0d` | `f1bcc99d1df372480e01a6492cb4d756ea673379a9e0efdd09820374d849ed8b` | 0 | yes | yes |
| `plugin-education-agent-skills-teach-back-evaluator` | `4c5a05f48b132ebff2429295b7650e1446c724f123a4781969f124c0afaeea45` | `9641f6ae84fd8170e30cb5e5692ee9fa5b4e52828220b4c9842cc4d1155fcb2f` | 0 | yes | yes |
| `plugin-education-agent-skills-teacher-inquiry-cycle-designer` | `40c30f413b85879eb9dc079eaa8f14327d02ecb4db6f71d661da5cecf3ff3228` | `5940b17ebdf0afda075f6cea2a91213fab34a42c5bef51911642c5898a66f1ab` | 0 | yes | yes |
| `plugin-education-agent-skills-technological-pedagogical-content-knowledge-developer` | `e207dd2e0c30a10515f7c97265b2b31e47fdf02bed86c7b889127243d3fa6de3` | `7a250728d9901a9aa386b37df61c4816193c46939dcd017c883b92600aa5c9cb` | 1 | yes | yes |
| `plugin-education-agent-skills-text-complexity-analyser` | `1fe9e0246cd88ec2f83fd287a7a95883407be75717edc60232843927a3b167ae` | `1c52e413c987542c7b7d53b88c12d281d44a96b3d3280786e738debbe442ddcc` | 0 | yes | yes |
| `plugin-education-agent-skills-think-aloud-script-generator` | `ea4c3390ef2737a44f91183f33a2fa386cb1d03c1ed30a0dbf2856f39f9ad17a` | `774f44af737838248bf06448d00558732d9c05fe391fdbfdb3a9ea113a49b7a9` | 0 | yes | yes |
| `plugin-education-agent-skills-three-part-lesson-designer` | `51a656ac288766dbe9aa8e26ac47de50e00268e5f76dd88a3d3c1257ba9cb5d4` | `75470e918f792709450697847c16a12beb3fc5dacaea896bbb3a5c14b569730f` | 0 | yes | yes |
| `plugin-education-agent-skills-transfer-bridge` | `2a2f9b50b1109c072eb3dda5bc9695c6a52c9108cbd3d0d9e0fbf23b05e75a7d` | `f944a4eb428bbf4065bc5f8dbf1b7653cb0d0789693727818d94974b83cf39e2` | 0 | yes | yes |
| `plugin-education-agent-skills-trauma-informed-practice-designer` | `c14fd6d13cd5301548c3f7f730be0bb4e3c7ea381a7abf759a3696baa1af43e8` | `ad03816117c51b18d78182e5401c45eb8be7ab75fcbc528aa8d116feff90997d` | 0 | yes | yes |
| `plugin-education-agent-skills-ubuntu-collective-knowledge-task-designer` | `23dae5194556ff36ac45db71cc27d75a068b3fa140994070a71f0c6b546b43f6` | `a92457310a8c8d9acf13b4bfcbe06f479e54806bb2db48ed9021f75e1c03b9fe` | 0 | yes | yes |
| `plugin-education-agent-skills-udl-barrier-anticipator` | `0e08a65b71c7cf29e8a8634814a552e9b81026ba5d655b2758d7dc15193054f5` | `ddc1d97728d9a06a49b97c1cb2e212822e15712fe2abfc0f46dfcdb5cd610126` | 0 | yes | yes |
| `plugin-education-agent-skills-udl-lesson-auditor` | `e4d12f1e0bf00af74210a8ede952161045b7ece2a967635fcd7d4ccc79617aff` | `2fe5938cd6b30868bf5f7a17629d8c1df770a69901ab848bb7b7d75ee7f5683b` | 0 | yes | yes |
| `plugin-education-agent-skills-udl-options-designer` | `c3fc378ae98f898cdbbf252c9635d798c3704c844ac6e5b19132ee79fbd07d95` | `fa2c777fccd35b7bd0ee0d4a4e8f5ad58a10560048a81e52528ad01c95095371` | 0 | yes | yes |
| `plugin-education-agent-skills-unassisted-evidence-checkpoint` | `f06b0d6094d896fe32037cca6b7a4d4c59bb045e4253c3e11505d384ed00097c` | `838e95c8016c518c1ae3c05bd2e6d3bb5c8e70b40864c91d92f99ccd5c521ef4` | 0 | yes | yes |
| `plugin-education-agent-skills-uninterrupted-work-cycle-designer` | `e107174a3ad50a25e73d93209248a05f6cbe2c8a70bfca285530b4693aa7d38e` | `9a1c95a7699f707d5dc725f6e935a666561f017eaa52ab80efba224a369f5e9e` | 0 | yes | yes |
| `plugin-education-agent-skills-variation-theory-task-designer` | `801e85eeeda6d6ac343bbc9c5a0dbc4a42cb8838cb2d99ae09e59b7faafe331d` | `9f6d1867eef6306ce28f2bd3274bb91500cc39376e0f987b81e378c18c353ce1` | 0 | yes | yes |
| `plugin-education-agent-skills-vocabulary-tiering-tool` | `1aef674ad7e0ddb1314a60cb8026a26c1d008c4e59023dcebbd1ea36911d2e52` | `10ed485c181161b6d394c8366ae07bb5cd8d2c284f96d5c88ddadd76e6ee00d1` | 0 | yes | yes |
| `plugin-education-agent-skills-weekly-agency-review` | `533347508c9845f1874e99d2fae1c2686aaf3f121411fac51082cc0afd8c6d52` | `8d83df2125dbf7c9c1f117381e2bc062b647b73df0207eee5583f983a9bedca1` | 0 | yes | yes |
| `plugin-education-agent-skills-wellbeing-learning-connection-mapper` | `ffaba089c9c7d8f773dbff2fc3a7e3e88061a4fc3e507fe552eac34ec37aa6d3` | `570a10b531cce81ae8e94525f9ee3a604d5db00f5ca3d06db974eb922b72e782` | 0 | yes | yes |
| `plugin-education-agent-skills-worked-example-fading-designer` | `51bd81413dfa6a2a011d858140e310902f51c0875f204ac51594d9843429e9d9` | `88a219c8823d6b588e97b3b5a49e3035015781318434d795f67a0d199b00e578` | 0 | yes | yes |
| `plugin-education-agent-skills-worked-example-to-problem-solving-transition-designer` | `60ca2fc2b7df24d1e9834f65c90231adfeeeadccf930ff12d0116c305de7e73d` | `bee0ae3c2757329b05ed19ad0791fdb85f5bd99149011e9fbf26073200e241fd` | 0 | yes | yes |

## Machine Review Artifact

| artifact | path | sha256 |
|---|---|---|
| extension review | `audits/education-agent-skills/v3.1.0/artifacts/extension-review.json` | `888e74541e8cc474f9cb84ad614a4c404eb4f388a8fbecdb25256151a2005a7c` |

## Human Confirmation

- production review status: `approved`
- approved aggregate SHA-256: `3b473a920a815e10ada837e9f46f4990094a890e3e60bc4a4b9cae8e51d8671f`
- approved by: `user` at `2026-11-23T00:25:07Z`

- [x] 136 个上游语义义务均由 extension SKILL 或 graph profile 承接。
- [x] extension 的 ResearchSpec 流程权威边界已声明；next-node / next-phase / agent-team 命中由 Agent 按上下文审阅。
- [x] 命名、registry、审计记录、锚点 manifest 身份一致。
- [x] Agent 语义审阅见 `05-semantic-review.md`。

## 增量审计依据

见 [上游审查](upstream-review.md)、[证据绑定](incremental-binding.json)、[完整预览](artifacts/preview-manifest.json)与[语义审查](05-semantic-review.md)。
