# ResearchSpec Domain Taxonomy

本文件是 ResearchSpec domain 划分的唯一规范性说明。学科型 domain 仅采用 **ANZSRC 2020 Fields of Research (FoR) Group**；FoR Field 只用于 vendor audit 元数据，不直接决定安装成员关系。ResearchSpec 不叠加其他外部分类标准。

## 分类来源与版本

- 标准：Australian and New Zealand Standard Research Classification (ANZSRC), Fields of Research, 2020。
- 数据发布：2025-10-24（这是 2020 edition 工作簿的发布日期，不代表“ANZSRC 2025”）。
- 来源：<https://www.abs.gov.au/statistics/classifications/australian-and-new-zealand-standard-research-classification-anzsrc/latest-release>
- 源工作簿 SHA-256：`92b94664eb1e43db1cbcaeb54e60575e3f8573cd10e5e4bb3a9c806cbe462e35`。
- 署名：Australian Bureau of Statistics and Stats NZ。分类数据按 CC BY 4.0 使用。
- 仓库快照：`src/plugins/taxonomy/anzsrc-for-2020.json`，包含 23 个 Division、213 个 Group、1,967 个 Field。

## Domain 模型

每个 ANZSRC Group 对应一个固定的学科型 domain。`domain_id` 由官方英文 Group title 规范化为 kebab-case；四位 Group code 另存为 `anzsrc_group_code`。domain 的 Skill 列表由 `src/plugins/domain-catalog.json` 显式审校维护，不能从 Field 映射自动生成。

ResearchSpec 另维护五个粗粒度工具型 domain：

- `experimental-design-and-data-analysis` — Cross-disciplinary experimental design, data preparation, measurement evaluation, statistical analysis, evidence synthesis, and quantitative interpretation.
- `computational-modeling-and-simulation` — Cross-disciplinary construction, execution, and interpretation of computational models and simulations.
- `scientific-visualization-and-communication` — Cross-disciplinary creation of scientific figures, diagrams, presentations, and other visual research communication.
- `laboratory-automation-and-informatics` — Cross-disciplinary laboratory automation, instruments, protocols, sample operations, and laboratory information systems.
- `research-computing-infrastructure` — Cross-disciplinary research computing environments, scalable execution, workflow infrastructure, and data storage operations.

若 Skill 的核心语义能明确归入 ANZSRC Group（例如 Machine learning、Statistics、Clinical sciences），优先归入学科型 domain。工具域只补充跨学科工作类型。Reference management 不作为工具域。

## 内部目录与用户可见性

Registry Schema 1 内部固定保存 213 个学科型 domain 和 5 个工具型 domain，共 218 个。只有 `skills` 非空的 domain 才是公开可用项：普通 `plugin list/show/install`、JSON、status available、check 和 Navigate 均隐藏或拒绝空 domain。

若已选 domain 在后续版本中被移除或变空，`plugin list --installed` 与 status 仍将其显示为 unavailable，以保留 manifest resolution snapshot 的安全卸载能力；update 会阻断。该 domain 后续重新获得 Skills 时，会在同一 ID 下恢复可用。

当前 ToolUniverse 与 Scientific Agent Skills 合计提供 48 个非空 domain。Scientific Agent Skills 的 49 个准入 Skills 经人工加入 19 个 ANZSRC Group domain 和全部五个工具域，其中部分 domain 已由 ToolUniverse 激活。其他 domain 允许为空，并对用户隐藏。

## ANZSRC Division 与 Group 完整名录


### 30 AGRICULTURAL, VETERINARY AND FOOD SCIENCES

- `3001` Agricultural biotechnology — `agricultural-biotechnology`
- `3002` Agriculture, land and farm management — `agriculture-land-and-farm-management`
- `3003` Animal production — `animal-production`
- `3004` Crop and pasture production — `crop-and-pasture-production`
- `3005` Fisheries sciences — `fisheries-sciences`
- `3006` Food sciences — `food-sciences`
- `3007` Forestry sciences — `forestry-sciences`
- `3008` Horticultural production — `horticultural-production`
- `3009` Veterinary sciences — `veterinary-sciences`
- `3099` Other agricultural, veterinary and food sciences — `other-agricultural-veterinary-and-food-sciences`

### 31 BIOLOGICAL SCIENCES

- `3101` Biochemistry and cell biology — `biochemistry-and-cell-biology`
- `3102` Bioinformatics and computational biology — `bioinformatics-and-computational-biology`
- `3103` Ecology — `ecology`
- `3104` Evolutionary biology — `evolutionary-biology`
- `3105` Genetics — `genetics`
- `3106` Industrial biotechnology — `industrial-biotechnology`
- `3107` Microbiology — `microbiology`
- `3108` Plant biology — `plant-biology`
- `3109` Zoology — `zoology`
- `3199` Other biological sciences — `other-biological-sciences`

### 32 BIOMEDICAL AND CLINICAL SCIENCES

- `3201` Cardiovascular medicine and haematology — `cardiovascular-medicine-and-haematology`
- `3202` Clinical sciences — `clinical-sciences`
- `3203` Dentistry — `dentistry`
- `3204` Immunology — `immunology`
- `3205` Medical biochemistry and metabolomics — `medical-biochemistry-and-metabolomics`
- `3206` Medical biotechnology — `medical-biotechnology`
- `3207` Medical microbiology — `medical-microbiology`
- `3208` Medical physiology — `medical-physiology`
- `3209` Neurosciences — `neurosciences`
- `3210` Nutrition and dietetics — `nutrition-and-dietetics`
- `3211` Oncology and carcinogenesis — `oncology-and-carcinogenesis`
- `3212` Ophthalmology and optometry — `ophthalmology-and-optometry`
- `3213` Paediatrics — `paediatrics`
- `3214` Pharmacology and pharmaceutical sciences — `pharmacology-and-pharmaceutical-sciences`
- `3215` Reproductive medicine — `reproductive-medicine`
- `3299` Other biomedical and clinical sciences — `other-biomedical-and-clinical-sciences`

### 33 BUILT ENVIRONMENT AND DESIGN

- `3301` Architecture — `architecture`
- `3302` Building — `building`
- `3303` Design — `design`
- `3304` Urban and regional planning — `urban-and-regional-planning`
- `3399` Other built environment and design — `other-built-environment-and-design`

### 34 CHEMICAL SCIENCES

- `3401` Analytical chemistry — `analytical-chemistry`
- `3402` Inorganic chemistry — `inorganic-chemistry`
- `3403` Macromolecular and materials chemistry — `macromolecular-and-materials-chemistry`
- `3404` Medicinal and biomolecular chemistry — `medicinal-and-biomolecular-chemistry`
- `3405` Organic chemistry — `organic-chemistry`
- `3406` Physical chemistry — `physical-chemistry`
- `3407` Theoretical and computational chemistry — `theoretical-and-computational-chemistry`
- `3499` Other chemical sciences — `other-chemical-sciences`

### 35 COMMERCE, MANAGEMENT, TOURISM AND SERVICES

- `3501` Accounting, auditing and accountability — `accounting-auditing-and-accountability`
- `3502` Banking, finance and investment — `banking-finance-and-investment`
- `3503` Business systems in context — `business-systems-in-context`
- `3504` Commercial services — `commercial-services`
- `3505` Human resources and industrial relations — `human-resources-and-industrial-relations`
- `3506` Marketing — `marketing`
- `3507` Strategy, management and organisational behaviour — `strategy-management-and-organisational-behaviour`
- `3508` Tourism — `tourism`
- `3509` Transportation, logistics and supply chains — `transportation-logistics-and-supply-chains`
- `3599` Other commerce, management, tourism and services — `other-commerce-management-tourism-and-services`

### 36 CREATIVE ARTS AND WRITING

- `3601` Art history, theory and criticism — `art-history-theory-and-criticism`
- `3602` Creative and professional writing — `creative-and-professional-writing`
- `3603` Music — `music`
- `3604` Performing arts — `performing-arts`
- `3605` Screen and digital media — `screen-and-digital-media`
- `3606` Visual arts — `visual-arts`
- `3699` Other creative arts and writing — `other-creative-arts-and-writing`

### 37 EARTH SCIENCES

- `3701` Atmospheric sciences — `atmospheric-sciences`
- `3702` Climate change science — `climate-change-science`
- `3703` Geochemistry — `geochemistry`
- `3704` Geoinformatics — `geoinformatics`
- `3705` Geology — `geology`
- `3706` Geophysics — `geophysics`
- `3707` Hydrology — `hydrology`
- `3708` Oceanography — `oceanography`
- `3709` Physical geography and environmental geoscience — `physical-geography-and-environmental-geoscience`
- `3799` Other earth sciences — `other-earth-sciences`

### 38 ECONOMICS

- `3801` Applied economics — `applied-economics`
- `3802` Econometrics — `econometrics`
- `3803` Economic theory — `economic-theory`
- `3899` Other economics — `other-economics`

### 39 EDUCATION

- `3901` Curriculum and pedagogy — `curriculum-and-pedagogy`
- `3902` Education policy, sociology and philosophy — `education-policy-sociology-and-philosophy`
- `3903` Education systems — `education-systems`
- `3904` Specialist studies in education — `specialist-studies-in-education`
- `3999` Other Education — `other-education`

### 40 ENGINEERING

- `4001` Aerospace engineering — `aerospace-engineering`
- `4002` Automotive engineering — `automotive-engineering`
- `4003` Biomedical engineering — `biomedical-engineering`
- `4004` Chemical engineering — `chemical-engineering`
- `4005` Civil engineering — `civil-engineering`
- `4006` Communications engineering — `communications-engineering`
- `4007` Control engineering, mechatronics and robotics — `control-engineering-mechatronics-and-robotics`
- `4008` Electrical engineering — `electrical-engineering`
- `4009` Electronics, sensors and digital hardware — `electronics-sensors-and-digital-hardware`
- `4010` Engineering practice and education — `engineering-practice-and-education`
- `4011` Environmental engineering — `environmental-engineering`
- `4012` Fluid mechanics and thermal engineering — `fluid-mechanics-and-thermal-engineering`
- `4013` Geomatic engineering — `geomatic-engineering`
- `4014` Manufacturing engineering — `manufacturing-engineering`
- `4015` Maritime engineering — `maritime-engineering`
- `4016` Materials engineering — `materials-engineering`
- `4017` Mechanical engineering — `mechanical-engineering`
- `4018` Nanotechnology — `nanotechnology`
- `4019` Resources engineering and extractive metallurgy — `resources-engineering-and-extractive-metallurgy`
- `4099` Other engineering — `other-engineering`

### 41 ENVIRONMENTAL SCIENCES

- `4101` Climate change impacts and adaptation — `climate-change-impacts-and-adaptation`
- `4102` Ecological applications — `ecological-applications`
- `4103` Environmental biotechnology — `environmental-biotechnology`
- `4104` Environmental management — `environmental-management`
- `4105` Pollution and contamination — `pollution-and-contamination`
- `4106` Soil sciences — `soil-sciences`
- `4199` Other environmental sciences — `other-environmental-sciences`

### 42 HEALTH SCIENCES

- `4201` Allied health and rehabilitation science — `allied-health-and-rehabilitation-science`
- `4202` Epidemiology — `epidemiology`
- `4203` Health services and systems — `health-services-and-systems`
- `4204` Midwifery — `midwifery`
- `4205` Nursing — `nursing`
- `4206` Public health — `public-health`
- `4207` Sports science and exercise — `sports-science-and-exercise`
- `4208` Traditional, complementary and integrative medicine — `traditional-complementary-and-integrative-medicine`
- `4299` Other health sciences — `other-health-sciences`

### 43 HISTORY, HERITAGE AND ARCHAEOLOGY

- `4301` Archaeology — `archaeology`
- `4302` Heritage, archive and museum studies — `heritage-archive-and-museum-studies`
- `4303` Historical studies — `historical-studies`
- `4399` Other history, heritage and archaeology — `other-history-heritage-and-archaeology`

### 44 HUMAN SOCIETY

- `4401` Anthropology — `anthropology`
- `4402` Criminology — `criminology`
- `4403` Demography — `demography`
- `4404` Development studies — `development-studies`
- `4405` Gender studies — `gender-studies`
- `4406` Human geography — `human-geography`
- `4407` Policy and administration — `policy-and-administration`
- `4408` Political science — `political-science`
- `4409` Social work — `social-work`
- `4410` Sociology — `sociology`
- `4499` Other human society — `other-human-society`

### 45 INDIGENOUS STUDIES

- `4501` Aboriginal and Torres Strait Islander culture, language and history — `aboriginal-and-torres-strait-islander-culture-language-and-history`
- `4502` Aboriginal and Torres Strait Islander education — `aboriginal-and-torres-strait-islander-education`
- `4503` Aboriginal and Torres Strait Islander environmental knowledges and management — `aboriginal-and-torres-strait-islander-environmental-knowledges-and-management`
- `4504` Aboriginal and Torres Strait Islander health and wellbeing — `aboriginal-and-torres-strait-islander-health-and-wellbeing`
- `4505` Aboriginal and Torres Strait Islander peoples, society and community — `aboriginal-and-torres-strait-islander-peoples-society-and-community`
- `4506` Aboriginal and Torres Strait Islander sciences — `aboriginal-and-torres-strait-islander-sciences`
- `4507` Te ahurea, reo me te hītori o te Māori (Māori culture, language and history) — `te-ahurea-reo-me-te-hitori-o-te-maori-maori-culture-language-and-history`
- `4508` Mātauranga Māori (Māori education) — `matauranga-maori-maori-education`
- `4509` Ngā mātauranga taiao o te Māori (Māori environmental knowledges) — `nga-matauranga-taiao-o-te-maori-maori-environmental-knowledges`
- `4510` Te hauora me te oranga o te Māori (Māori health and wellbeing) — `te-hauora-me-te-oranga-o-te-maori-maori-health-and-wellbeing`
- `4511` Ngā tāngata, te porihanga me ngā hapori o te Māori (Māori peoples, society and community) — `nga-tangata-te-porihanga-me-nga-hapori-o-te-maori-maori-peoples-society-and-community`
- `4512` Ngā pūtaiao Māori (Māori sciences) — `nga-putaiao-maori-maori-sciences`
- `4513` Pacific Peoples culture, language and history — `pacific-peoples-culture-language-and-history`
- `4514` Pacific Peoples education — `pacific-peoples-education`
- `4515` Pacific Peoples environmental knowledges — `pacific-peoples-environmental-knowledges`
- `4516` Pacific Peoples health and wellbeing — `pacific-peoples-health-and-wellbeing`
- `4517` Pacific Peoples sciences — `pacific-peoples-sciences`
- `4518` Pacific Peoples society and community — `pacific-peoples-society-and-community`
- `4519` Other Indigenous data, methodologies and global Indigenous studies — `other-indigenous-data-methodologies-and-global-indigenous-studies`
- `4599` Other Indigenous studies — `other-indigenous-studies`

### 46 INFORMATION AND COMPUTING SCIENCES

- `4601` Applied computing — `applied-computing`
- `4602` Artificial intelligence — `artificial-intelligence`
- `4603` Computer vision and multimedia computation — `computer-vision-and-multimedia-computation`
- `4604` Cybersecurity and privacy — `cybersecurity-and-privacy`
- `4605` Data management and data science — `data-management-and-data-science`
- `4606` Distributed computing and systems software — `distributed-computing-and-systems-software`
- `4607` Graphics, augmented reality and games — `graphics-augmented-reality-and-games`
- `4608` Human-centred computing — `human-centred-computing`
- `4609` Information systems — `information-systems`
- `4610` Library and information studies — `library-and-information-studies`
- `4611` Machine learning — `machine-learning`
- `4612` Software engineering — `software-engineering`
- `4613` Theory of computation — `theory-of-computation`
- `4699` Other information and computing sciences — `other-information-and-computing-sciences`

### 47 LANGUAGE, COMMUNICATION AND CULTURE

- `4701` Communication and media studies — `communication-and-media-studies`
- `4702` Cultural studies — `cultural-studies`
- `4703` Language studies — `language-studies`
- `4704` Linguistics — `linguistics`
- `4705` Literary studies — `literary-studies`
- `4799` Other language, communication and culture — `other-language-communication-and-culture`

### 48 LAW AND LEGAL STUDIES

- `4801` Commercial law — `commercial-law`
- `4802` Environmental and resources law — `environmental-and-resources-law`
- `4803` International and comparative law — `international-and-comparative-law`
- `4804` Law in context — `law-in-context`
- `4805` Legal systems — `legal-systems`
- `4806` Private law and civil obligations — `private-law-and-civil-obligations`
- `4807` Public law — `public-law`
- `4899` Other law and legal studies — `other-law-and-legal-studies`

### 49 MATHEMATICAL SCIENCES

- `4901` Applied mathematics — `applied-mathematics`
- `4902` Mathematical physics — `mathematical-physics`
- `4903` Numerical and computational mathematics — `numerical-and-computational-mathematics`
- `4904` Pure mathematics — `pure-mathematics`
- `4905` Statistics — `statistics`
- `4999` Other mathematical sciences — `other-mathematical-sciences`

### 50 PHILOSOPHY AND RELIGIOUS STUDIES

- `5001` Applied ethics — `applied-ethics`
- `5002` History and philosophy of specific fields — `history-and-philosophy-of-specific-fields`
- `5003` Philosophy — `philosophy`
- `5004` Religious studies — `religious-studies`
- `5005` Theology — `theology`
- `5099` Other philosophy and religious studies — `other-philosophy-and-religious-studies`

### 51 PHYSICAL SCIENCES

- `5101` Astronomical sciences — `astronomical-sciences`
- `5102` Atomic, molecular and optical physics — `atomic-molecular-and-optical-physics`
- `5103` Classical physics — `classical-physics`
- `5104` Condensed matter physics — `condensed-matter-physics`
- `5105` Medical and biological physics — `medical-and-biological-physics`
- `5106` Nuclear and plasma physics — `nuclear-and-plasma-physics`
- `5107` Particle and high energy physics — `particle-and-high-energy-physics`
- `5108` Quantum physics — `quantum-physics`
- `5109` Space sciences — `space-sciences`
- `5110` Synchrotrons and accelerators — `synchrotrons-and-accelerators`
- `5199` Other physical sciences — `other-physical-sciences`

### 52 PSYCHOLOGY

- `5201` Applied and developmental psychology — `applied-and-developmental-psychology`
- `5202` Biological psychology — `biological-psychology`
- `5203` Clinical and health psychology — `clinical-and-health-psychology`
- `5204` Cognitive and computational psychology — `cognitive-and-computational-psychology`
- `5205` Social and personality psychology — `social-and-personality-psychology`
- `5299` Other psychology — `other-psychology`

## Vendor audit Field 元数据

每条 audit 记录使用 `primary_anzsrc_field`、`additional_anzsrc_fields` 和 `anzsrc_unclassified_reason`。有 primary 时 reason 必须为空，additional 必须去重且不能重复 primary；无 primary 时必须说明原因且 additional 为空。Field 分类是来源审计证据，不表示准入、domain membership 或依赖关系。

## 维护边界

Vendor converter 决定 Skill 从哪里来、如何适配、适用许可证及硬依赖；source-neutral domain catalog 决定 domain 直接包含哪些 Skill；central assembler 验证二者并生成生产 registry。用户只按 domain 安装，vendor 对用户透明。ResearchSpec 只分发静态审校资产，不执行插件脚本、不安装依赖，也不授予 workflow authority。
