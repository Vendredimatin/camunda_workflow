<template>
    <div>
        <Modal
            v-model="iconModal"
            width="900"
            :mask-closable="false"
            title="图片管理器"
            >
            <div class="img-content">

                <Tabs :value="currentTabs" @on-click="switchTabs" name="image">
                    <TabPane label="图片" name="图片" :disabled="imgTab" tab="image">
                        <ul class="imgWrap" v-show="!noPic">
                            <li v-for="(pic, index) in imgList" class="picItem" :key="pic.oid">
                                <div class="imgBox" :class="{activeImg:picIndex==index}" @click="addAct(index, pic)">
                                    <img :src="`${baseUrl}/files-download/${pic.oid}`">
                                    <div class="actFlag">
                                        <Icon type="ios-checkmark" />
                                    </div>
                                    <div class="viewMask">
                                        <Icon type="ios-eye-outline" @click.native="handleView(pic)"></Icon>
                                    </div>
                                </div>
                                <p class="picTitle">{{ pic.cname }}</p>
                            </li>
                        </ul>
                        <div v-show="noPic" class="noPicBox">
                            <svg t="1567515559219" class="icon" viewBox="0 0 1213 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5739" width="150" height="150"><path d="M1115.198992 777.056948c0-199.071174-39.735238-394.666502-200.145527-470.819125-57.035471-27.0642-241.523892 297.832595-308.08634 297.832595-100.246555 0-144.279203-475.195532-219.768257-417.101507-115.334887 88.744665-189.875982 426.991869-189.875981 590.088037 350.712851 4.913582 538.85091 15.277923 917.876105 0z" fill="#C5C5C5" p-id="5740"></path><path d="M606.998723 875.044204c0-120.185271-23.161773-261.19402-116.614629-307.154182-33.178529-16.352275-140.724361 202.720812-179.464244 202.720812-58.457408 0-84.052273-286.915279-127.974326-251.840834-67.21022 53.575425-110.595097 257.81297-110.595097 356.274204 204.190147 2.93867 313.805687 9.226791 534.648296 0z" fill="#CFCFCF" p-id="5741"></path><path d="M527.354454 761.273448c0-120.185271 23.145974-261.19402 116.61463-307.169981 33.178529-16.336476 140.724361 202.736611 179.448444 202.736611 58.457408 0 84.068073-286.915279 127.974326-251.856633 67.21022 53.591224 110.595097 257.81297 110.595097 356.290003-204.174348 2.93867-313.789888 9.226791-534.632497 0z" fill="#CFCFCF" p-id="5742"></path><path d="M1069.128234 804.468733c46.165553 21.597642 72.676778 46.718529 72.676778 73.514141 0 80.576428-239.422585 146.017126-534.758891 146.017126-114.055143 0-219.768256-9.748168-306.506411-26.369031-12.829031 4.5028-32.973138 7.409871-55.629333 7.409872-38.739882 0-70.14889-8.500023-70.14889-18.95916 0-5.592952 8.926604-10.617129 23.161773-14.092975-78.364526-25.389474-125.572833-58.18882-125.572833-94.005832 0-80.576428 239.422585-146.017126 534.758891-146.017126 90.466789 0 175.688211 6.145928 250.387299 16.968447 27.079999-8.089241 66.278062-13.176616 109.899928-13.176616 81.698178 0 147.913042 17.837409 147.913042 39.830035-0.110595 11.375496-17.805811 21.629241-46.181353 28.881119z" fill="#DDDDDD" p-id="5743"></path><path d="M161.300484 386.988043l540.336043-126.031013a45.501983 45.501983 0 0 1 54.649778 33.984293l0.284387 1.295543 76.816194 378.851403-646.19135 112.175027-83.167513-109.204758 22.119019-250.861278a45.501983 45.501983 0 0 1 35.153442-40.209217z" fill="#BFBFBF" p-id="5744"></path><path d="M266.302628 821.768966l556.988506-142.746671a45.501983 45.501983 0 0 0 33.889497-38.629287l14.124574-117.009613-684.109669 263.943098 42.658108 28.280746a45.549381 45.549381 0 0 0 36.448984 6.161727z" fill="#B0B0B0" p-id="5745"></path><path d="M165.108115 382.848626l539.530279-124.561677a45.533581 45.533581 0 0 1 54.58658 34.110687l81.034608 351.060436a45.501983 45.501983 0 0 1-34.094889 54.58658l-539.530279 124.561677a45.517782 45.517782 0 0 1-54.58658-34.110688l-81.034607-351.060435a45.501983 45.501983 0 0 1 34.094888-54.58658z" fill="#D0D0D0" p-id="5746"></path><path d="M186.152782 427.623841l519.196581-119.869286a7.599463 7.599463 0 0 1 9.100396 5.687748l76.358015 330.726737a7.599463 7.599463 0 0 1-5.687748 9.100397L265.923445 773.138722a7.583664 7.583664 0 0 1-9.100396-5.687748l-76.358015-330.726737a7.599463 7.599463 0 0 1 5.687748-9.100396z" fill="#F2F2F2" p-id="5747"></path><path d="M363.326127 460.786571l112.175026 107.514233a15.183127 15.183127 0 0 0 21.139463-0.142194l70.212087-69.153534a15.183127 15.183127 0 0 1 20.902474-0.363384l109.83673 100.83113a15.167328 15.167328 0 0 1-6.841097 25.958249l-373.700832 86.279975a15.167328 15.167328 0 0 1-18.358786-17.37923l39.198063-225.187416a15.183127 15.183127 0 0 1 25.436872-8.357829zM635.437462 472.778239a48.345857 48.345857 0 1 0-57.999228-36.243593 48.361656 48.361656 0 0 0 57.999228 36.243593z" fill="#D8D8D8" p-id="5748"></path><path d="M385.650537 383.054017h632.66715a45.501983 45.501983 0 0 1 45.470384 43.76406l12.386651 320.393995-579.929088 24.36252-167.725364 38.123709 11.659883-382.51684a45.501983 45.501983 0 0 1 45.470384-44.127444z" fill="#BFBFBF" p-id="5749"></path><path d="M384.070607 887.462454h634.152284a45.501983 45.501983 0 0 0 45.217596-39.766837l12.797432-100.546743-566.705074 19.022357-181.012575 43.52707 11.612485 43.906254a45.533581 45.533581 0 0 0 43.937852 33.857899z" fill="#B0B0B0" p-id="5750"></path><path d="M341.507294 383.054017m45.517782 0l629.554688 0q45.517782 0 45.517782 45.517782l0 413.372873q0 45.517782-45.517782 45.517782l-629.554688 0q-45.517782 0-45.517782-45.517782l0-413.372873q0-45.517782 45.517782-45.517782Z" fill="#D0D0D0" p-id="5751"></path><path d="M395.556698 437.087621m7.583664 0l597.339916 0q7.583664 0 7.583664 7.583664l0 381.158101q0 7.583664-7.583664 7.583664l-597.339916 0q-7.583664 0-7.583664-7.583664l0-381.158101q0-7.583664 7.583664-7.583664Z" fill="#F2F2F2" p-id="5752"></path><path d="M586.807219 514.962369l97.955657 149.52457a15.167328 15.167328 0 0 0 20.633885 4.613396l96.75491-59.436965a15.151528 15.151528 0 0 1 20.444294 4.344807l97.070896 141.624921a15.167328 15.167328 0 0 1-12.513045 23.69895H472.546684a15.151528 15.151528 0 0 1-14.045577-21.060467l101.636894-240.939317a15.183127 15.183127 0 0 1 26.669218-2.369895z" fill="#D8D8D8" p-id="5753"></path><path d="M881.953933 545.186429m-54.049404 0a54.049404 54.049404 0 1 0 108.098808 0 54.049404 54.049404 0 1 0-108.098808 0Z" fill="#D8D8D8" p-id="5754"></path><path d="M1183.515163 390.637681v-18.95916a3.791832 3.791832 0 1 1 7.583664 0v18.95916h18.959159a3.791832 3.791832 0 0 1 0 7.583663h-18.959159v18.95916a3.791832 3.791832 0 0 1-7.583664 0v-18.95916h-18.959159a3.791832 3.791832 0 1 1 0-7.583663z" fill="#BFBFBF" p-id="5755"></path><path d="M766.287261 125.162051v-18.95916a3.791832 3.791832 0 0 1 7.583664 0v18.95916h18.959159a3.791832 3.791832 0 0 1 0 7.583664h-18.959159v18.959159a3.791832 3.791832 0 1 1-7.583664 0v-18.959159h-18.959159a3.791832 3.791832 0 1 1 0-7.583664z" fill="#E2E2E2" p-id="5756"></path><path d="M512.187127 218.409517l13.397806-13.413606a3.791832 3.791832 0 0 1 5.371762 5.355963l-13.413606 13.413605 13.413606 13.413605a3.791832 3.791832 0 0 1-5.371762 5.355963l-13.397806-13.397806-13.413605 13.397806a3.791832 3.791832 0 1 1-5.355963-5.355963l13.397806-13.413605-13.397806-13.413605a3.791832 3.791832 0 1 1 5.355963-5.355963z" fill="#C5C5C5" p-id="5757"></path><path d="M119.637731 365.974974m-9.47958 0a9.47958 9.47958 0 1 0 18.95916 0 9.47958 9.47958 0 1 0-18.95916 0Z" fill="#D8D8D8" p-id="5758"></path><path d="M540.625866 104.291176m-9.47958 0a9.47958 9.47958 0 1 0 18.95916 0 9.47958 9.47958 0 1 0-18.95916 0Z" fill="#D8D8D8" p-id="5759"></path><path d="M254.279361 250.308302m-7.583663 0a7.583664 7.583664 0 1 0 15.167327 0 7.583664 7.583664 0 1 0-15.167327 0Z" fill="#D8D8D8" p-id="5760"></path><path d="M936.951295 98.603428m-7.583664 0a7.583664 7.583664 0 1 0 15.167327 0 7.583664 7.583664 0 1 0-15.167327 0Z" fill="#D8D8D8" p-id="5761"></path><path d="M292.21348 45.517782m-7.583664 0a7.583664 7.583664 0 1 0 15.167327 0 7.583664 7.583664 0 1 0-15.167327 0Z" fill="#D8D8D8" p-id="5762"></path><path d="M1111.40716 174.455865m-7.583664 0a7.583664 7.583664 0 1 0 15.167328 0 7.583664 7.583664 0 1 0-15.167328 0Z" fill="#BFBFBF" p-id="5763"></path><path d="M845.915731 212.389983m-7.583664 0a7.583664 7.583664 0 1 0 15.167328 0 7.583664 7.583664 0 1 0-15.167328 0Z" fill="#BFBFBF" p-id="5764"></path><path d="M79.823496 515.783932m-7.583664 0a7.583664 7.583664 0 1 0 15.167328 0 7.583664 7.583664 0 1 0-15.167328 0Z" fill="#BFBFBF" p-id="5765"></path><path d="M1046.930219 275.286995l13.413605-13.397806a3.791832 3.791832 0 0 1 5.371762 5.355962l-13.334609 13.413606 13.413605 13.413605a3.791832 3.791832 0 1 1-5.371762 5.355963l-13.413605-13.413606-13.397806 13.413606a3.791832 3.791832 0 0 1-5.371762-5.355963l13.413606-13.413605-13.413606-13.413606a3.791832 3.791832 0 0 1 5.371762-5.355962z" fill="#DDDDDD" p-id="5766"></path><path d="M141.598757 110.879484v-5.766744a2.71748 2.71748 0 0 1 5.41916 0v5.766744a11.05951 11.05951 0 0 0-2.717479-0.347585 10.917316 10.917316 0 0 0-2.701681 0.347585z m-6.635706 4.992579l-4.060419-4.07622a2.70958 2.70958 0 0 1 3.82343-3.839229l4.076219 4.076219a10.901517 10.901517 0 0 0-3.83923 3.83923z m-1.153348 8.199836h-5.687748a2.71748 2.71748 0 0 1 0-5.41916h5.766744a11.05951 11.05951 0 0 0-0.347584 2.71748 10.82252 10.82252 0 0 0 0.268588 2.70168z m4.992578 6.635706l-4.076219 4.076219a2.70958 2.70958 0 0 1-3.82343-3.83923l4.060419-4.076219a10.901517 10.901517 0 0 0 3.83923 3.83923z m8.215636 1.153349v5.766744a2.71748 2.71748 0 0 1-5.41916 0v-5.766744a10.917316 10.917316 0 0 0 2.701681 0.347584 11.05951 11.05951 0 0 0 2.780676-0.347584z m6.619907-4.992579l4.076219 4.076219a2.71748 2.71748 0 0 1-3.83923 3.83923l-4.06042-4.076219a10.854119 10.854119 0 0 0 3.823431-3.83923z m1.153348-8.215636h5.766745a2.71748 2.71748 0 0 1 0 5.41916h-5.766745a10.127351 10.127351 0 0 0 0.347585-2.70168 10.332742 10.332742 0 0 0-0.347585-2.71748z m-4.976779-6.572508l4.06042-4.076219a2.71748 2.71748 0 0 1 3.83923 3.839229l-4.076219 4.07622a10.854119 10.854119 0 0 0-3.823431-3.83923zM596.69758 186.731921v-5.766744a2.71748 2.71748 0 0 1 5.41916 0v5.766744a10.82252 10.82252 0 0 0-2.70168-0.347585 11.05951 11.05951 0 0 0-2.71748 0.347585z m-6.619906 4.976779l-4.07622-4.06042a2.71748 2.71748 0 0 1 3.83923-3.839229l4.06042 4.076219a11.05951 11.05951 0 0 0-3.82343 3.82343z m-1.153349 8.215636h-5.782544a2.71748 2.71748 0 0 1 0-5.41916h5.766744a11.05951 11.05951 0 0 0-0.347584 2.71748 10.82252 10.82252 0 0 0 0.363384 2.70168z m4.976779 6.635706l-4.06042 4.076219a2.71748 2.71748 0 0 1-3.83923-3.83923l4.07622-4.076219a11.05951 11.05951 0 0 0 3.82343 3.83923z m8.215636 1.153349v5.766744a2.71748 2.71748 0 0 1-5.41916 0v-5.766744a11.05951 11.05951 0 0 0 2.71748 0.347584 10.82252 10.82252 0 0 0 2.68588-0.347584z m6.635706-4.992579l4.076219 4.076219a2.71748 2.71748 0 1 1-3.83923 3.83923l-4.076219-4.076219a10.901517 10.901517 0 0 0 3.83923-3.83923z m1.153348-8.215636h5.766745a2.71748 2.71748 0 0 1 0 5.41916h-5.766745a10.82252 10.82252 0 0 0 0.347585-2.70168 11.05951 11.05951 0 0 0-0.347585-2.71748z m-4.992578-6.588307l4.076219-4.07622a2.71748 2.71748 0 1 1 3.83923 3.83923l-4.076219 4.06042a11.05951 11.05951 0 0 0-3.83923-3.82343zM19.691362 567.668832v-6.888495a3.254656 3.254656 0 0 1 6.509312 0v6.904294a13.603197 13.603197 0 0 0-6.509312 0z m-7.89965 5.987934L6.89393 568.774783a3.254656 3.254656 0 0 1 4.597596-4.597596l4.897783 4.881983a13.208214 13.208214 0 0 0-4.644994 4.597596z m-1.390338 9.858763H3.481281a3.254656 3.254656 0 1 1 0-6.493512h6.920093a13.034422 13.034422 0 0 0-0.410782 3.254656 12.813232 12.813232 0 0 0 0.363384 3.238856z m5.987935 7.89965l-4.897783 4.881984a3.254656 3.254656 0 1 1-4.597596-4.597597l4.897782-4.881983a13.208214 13.208214 0 0 0 4.550199 4.660793z m9.858762 1.390338v6.904294a3.254656 3.254656 0 1 1-6.509311 0v-6.904294a13.097619 13.097619 0 0 0 6.509311 0z m7.89965-5.987934l4.881984 4.881983a3.254656 3.254656 0 1 1-4.597596 4.597597l-4.881984-4.881984a13.208214 13.208214 0 0 0 4.597596-4.534399z m1.390339-9.858763h6.904293a3.254656 3.254656 0 1 1 0 6.493512h-6.904293a12.813232 12.813232 0 0 0 0.410781-3.15986 13.034422 13.034422 0 0 0-0.410781-3.270455z m-5.987935-7.89965l4.881984-4.881983a3.254656 3.254656 0 0 1 4.597596 4.597596l-4.881984 4.881983a13.208214 13.208214 0 0 0-4.597596-4.597596zM1153.670286 605.60295v-6.904294a3.254656 3.254656 0 0 1 6.493512 0v6.920093a12.813232 12.813232 0 0 0-3.238856-0.410781 13.034422 13.034422 0 0 0-3.254656 0.394982z m-7.89965 5.987935l-4.897782-4.881984a3.254656 3.254656 0 1 1 4.597596-4.597596l4.897783 4.881983a12.955426 12.955426 0 0 0-4.644995 4.597597z m-1.390338 9.858762h-6.920093a3.254656 3.254656 0 0 1 0-6.509311h6.920093a13.097619 13.097619 0 0 0 0 6.509311z m5.987935 7.89965l-4.897783 4.881984a3.254656 3.254656 0 1 1-4.597596-4.597596l4.897782-4.881984a12.955426 12.955426 0 0 0 4.565998 4.644994z m9.842963 1.390339v6.920093a3.254656 3.254656 0 0 1-6.493512 0v-6.920093a13.034422 13.034422 0 0 0 3.254656 0.410781 12.813232 12.813232 0 0 0 3.191458-0.363384z m7.89965-5.987935l4.881983 4.881984a3.254656 3.254656 0 0 1-4.597596 4.597596l-4.881983-4.881984a13.08182 13.08182 0 0 0 4.613395-4.550198z m1.390338-9.858763h6.904294a3.254656 3.254656 0 0 1 0 6.509312h-6.904294a13.097619 13.097619 0 0 0 0-6.509312z m-5.987934-7.89965l4.881983-4.881983a3.254656 3.254656 0 0 1 4.597596 4.597596l-4.881983 4.881984a13.08182 13.08182 0 0 0-4.581797-4.597597zM716.977647 11.865274V3.791832a3.791832 3.791832 0 1 1 7.583664 0v8.073442a15.404317 15.404317 0 0 0-7.583664 0z m-9.274188 6.99909l-5.703548-5.703547a3.791832 3.791832 0 0 1 5.371762-5.355963l5.703547 5.703547a15.167328 15.167328 0 0 0-5.371761 5.355963z m-1.57993 11.50189h-8.057643a3.791832 3.791832 0 0 1 0-7.583664h8.057643a15.404317 15.404317 0 0 0 0 7.583664z m6.999089 9.274189l-5.703547 5.703547a3.798152 3.798152 0 0 1-5.371762-5.371762l5.703547-5.687748a15.435916 15.435916 0 0 0 5.324364 5.340163z m11.486091 1.579929v8.057643a3.791832 3.791832 0 1 1-7.583664 0v-8.057643a15.404317 15.404317 0 0 0 7.583664 0z m9.289988-6.98329l5.703547 5.687748a3.798152 3.798152 0 0 1-5.371762 5.371762l-5.735145-5.671949a15.435916 15.435916 0 0 0 5.355962-5.355962z m1.57993-11.50189h8.073442a3.791832 3.791832 0 0 1 0 7.583664h-8.073442a14.930338 14.930338 0 0 0 0-7.583664z m-6.98329-9.24259l5.687748-5.687748a3.791832 3.791832 0 0 1 5.371761 5.355963l-5.703547 5.703547a15.167328 15.167328 0 0 0-5.355962-5.371762z" fill="#C5C5C5" p-id="5767"></path></svg>

                            <p>暂无图片, Deck君期待你的上传哦 ~</p>
                        </div>
                    </TabPane>
                    <!-- <TabPane label="图标" name="图标" :disabled="iconTab" tab="image">
                        <ul class="iconWrap">
                            <li v-for="icon in iconList" class="iconItem" :key="icon.value">
                                <Icon :type="icon.value" />
                                <p>{{ icon.label }}</p>
                            </li>
                        </ul>
                    </TabPane> -->
                </Tabs>

                <div class="function-wrap">
                    <Button type="primary" style="margin-right: 10px;">上传</Button>
                    <input type="file" ref="inputFile" class="fileImg" multiple accept="image/jpg, image/jpeg, image/png" @change="addImg">
                    <!-- <Button style="margin-right: 10px;" :disabled="iconDisTab" @click="imgRename">重命名</Button> -->
                    <Button style="margin-right: 10px;" @click="imgDel">删除</Button>
                    <Input v-model="searchImgName" style="width: 280px" search @on-search="searchPic" @on-change="searchReset" placeholder="搜索..." />
                </div>
            </div>
            <div slot="footer">
                <Button type="text" @click="iconModal = false">取消</Button>
                <Button type="primary" @click="confirmIcon">确认</Button>
            </div>
        </Modal>
        <!-- 图片重命名 -->
        <!-- <Modal
            v-model="renameModel"
            :mask-closable="false"
            title="图片重命名">
            <Input v-model="fixName" />
            <div slot="footer">
                <Button type="text" @click="cancelRename">取消</Button>
                <Button type="primary" @click="confirmRename">确认</Button>
            </div>
        </Modal> -->

        <!-- 图片预览 -->
        <Modal title="图片预览" v-model="viewModal">
            <img :src="`${this.baseUrl}/files-download/${viewImgUrl}`" style="width: 100%">
            <h4 style="margin-bottom: 10px;">图片尺寸</h4>
            <p style="margin-bottom: 5px;">宽度: {{ viewImgWidth }}</p>
            <p>高度: {{ viewImgHeight }}</p>
            <div slot="footer">
                <Button type="text" @click="viewModal = false">关闭</Button>
            </div>
        </Modal>
        <Spin fix v-if="spinShow"></Spin>
    </div>
</template>
<script>
import _global from '@/views/global.vue'
// import moduleIconData from "@/views/functional-model/components/moduleIcon.js";
// import fontIconData from "@/views/functional-model/components/iFontIcon.js";
import { getFiles, delFile } from "@/api/others";
import axios from "@/libs/anotherAxios";
import "@/styles/component/iconfont.css";

    export default {
        data() {
            return {
                baseUrl: '',
                iconModal: false,             // 图片列表弹窗
                renameModel: false,           // 重命名弹窗
                viewModal: false,             // 预览弹窗

                spinShow: false,              // 等待图片加载动画开关
                noPic: true,                  // 图片长度为0
                viewImgUrl: null,             // 预览图片准备对象
                viewImgWidth: 0,              // 预览图片准备对象宽度
                viewImgHeight: 0,             // 预览图片准备对象高度
                currentTabs: '图片',           // tabs选中标志
                iconDisTab: false,            // 图标不能重命名
                imgTab: true,                 // 图片tab可点击开关
                iconTab: true,                // 图标tab可点击开关

                iconList: [],                 // 图片列表

                searchImgName: '',            // 搜索的图片关键字
                picIndex: -1,                 // 选中态图片索引
                picIndexItem: null,           // 选中态图片对象
                picIndexLabel: '',

                fixName: '',                  // 重命名

                imgList: [],

                temImgList: []             // 克隆临时图片列表
            }
        },
        created() {

            this.baseUrl = _global.baseUrl;

            // this.iconList = moduleIconData;
            // this.iList = fontIconData;
            // this.initImg(false);
        },
        methods: {

            /**
             * @param(thenFlag: 是否继续完成图片信息回填事件)
            */
            initImg(thenFlag, imgLabel, needSearch) {

                this.spinShow = true;
                if(!needSearch) {
                    this.searchImgName = '';
                }
                this.imgList = [];
                this.temImgList = [];

                getFiles('picture_management').then(response => {

                    this.spinShow = false;

                    let res = response.data;
                    if(!response.success) {

                        this.$Message.error(res.message);

                    } else {
                        if(res.length == 0) {

                            this.noPic = true;

                        } else {

                            this.noPic = false;
                            if(needSearch) {
                                this.imgList = this.search(res, {
                                    cname: this.searchImgName
                                });
                            } else {
                                this.imgList = res;
                            }
                            this.temImgList = res;

                            // 编辑回填事件
                            if(thenFlag) {

                                if(this.imgList.length > 0) {

                                    if(imgLabel != '') {

                                        this.picIndex = this.imgList.findIndex(val => {
                                            return val.oid == imgLabel
                                        })
                                        
                                        if(this.picIndex > -1) {
                                            this.picIndexItem = this.imgList[this.picIndex]
                                        }

                                    } else {

                                        this.picIndex = -1;

                                    }

                                } else {
                                    this.picIndex = -1;
                                }

                            }

                        }
                    }
                  this.imgListCatch = _.cloneDeep(this.imgList);
                }).catch(e => {
                    this.spinShow = false;
                    console.log(e);
                });

            },

            /**
             * @description 图片信息回填
            */
            editModal(imgLabel, tabsState) {

                this.picIndexLabel = imgLabel;
                this.initImg(true, imgLabel);

                if(tabsState == '图片') {

                    this.iconTab = true;
                    this.imgTab = false;

                } else if(tabsState == '图标') {

                    this.imgTab = true;
                    this.iconTab = false;

                } else {

                    this.imgTab = false;
                    this.iconTab = false;

                }

                this.iconModal = true;

            },

            // 切换面板 图标不可重命名
            switchTabs(name) {

                this.iconDisTab = name == '图标' ? true : false;
            },

            search(data, argumentObj) {

                let res = data;
                let dataClone = data;
                for (let argu in argumentObj) {
                    if (argumentObj[argu].length > 0) {
                    res = dataClone.filter(d => {
                        return d[argu].indexOf(argumentObj[argu]) > -1;
                    });
                    dataClone = res;
                    }
                }
                return res;

            },

            /**
             * @description 清空搜索框 显示全部图片
            */
            searchReset(e) {

                let curValue = e.target.value;
                if(curValue == '') {
                    this.initImg(false)
                }

            },

            /**
             * @description 图片搜素
            */
            searchPic() {

                if(this.searchImgName == '') {

                    //this.imgList = this.temImgList;
                    // this.initImg(false)

                } else {
                    this.imgList = this.search( this.imgListCatch, {
                        cname: this.searchImgName
                    });
                }

            },

            /**
             * @description 图片预览
            */
            handleView(val) {

                var img = new Image();
                let self = this;
                img.onload = function(){

                    self.viewImgWidth = img.width;
                    self.viewImgHeight = img.height;

                    self.viewImgUrl = val.oid;
                    self.viewModal = true;

                }
                img.src = `${this.baseUrl}/files-download/${val.oid}`;

            },

            /**
             * @description 选择图片
            */
            addAct(index, item) {

                if(index != this.picIndex) {

                    this.picIndex = index;
                    this.picIndexItem = item;
                    this.picIndexLabel = item.oid;

                } else {

                    this.picIndex = -1;
                    this.picIndexItem = null;
                    this.picIndexLabel = '';

                }

            },

            /**
             * @description 重命名弹窗
            */
            // imgRename() {

            //     if(this.picIndex == -1) {
            //         this.$Message.warning('请先选择需要重命名的图片');
            //     } else {

            //         this.renameModel =  true;
            //         this.fixName = this.picIndexItem.filename;

            //     }

            // },

            /**
             * @description 确认重命名
            */
            // confirmRename() {

            //     if(this.fixName == '') {
            //         this.$Message.warning('图片名字不能为空哦~');
            //     } else {
            //         this.imgList[this.picIndex].filename = this.fixName;
            //         this.renameModel = false;
            //     }

            // },

            /**
             * @description 关闭重命名弹窗
            */
            // cancelRename() {

            //     this.renameModel = false;
            //     this.fixName = '';

            // },

            /**
             * @description 删除图片
            */
            imgDel() {

                // 删除图片
                if(this.currentTabs == '图片') {

                    if(this.picIndex == -1) {
                        this.$Message.warning('请先选择需要删除的图片');
                    } else {

                        delFile(this.picIndexItem.oid).then(res => {

                            if(!res.success) {
                                this.$Message.warning(res.message);
                            } else {

                                this.imgList.splice(this.picIndex, 1);
                                this.temImgList = this.imgList;
                                this.picIndex = -1;
                                this.picIndexItem = null;

                                if(this.imgList.length == 0) {
                                    this.noPic = true;
                                }
                              this.imgListCatch = _.cloneDeep(this.imgList);
                            }

                        }).catch(e => {
                            console.log(e);
                        });

                    }

                } else {

                }

            },

            /**
             * @description 上传图片
            */
            addImg(event) {

                this.spinShow = true;
                // 上传图片
                if(this.currentTabs == '图片') {

                    let fileList = event.target.files;
                    let fileLength = fileList.length;

                    if(fileList && fileList != undefined) {

                        // 批量上传一次不允许超过8张
                        if(fileLength > 8) {
                            this.$Message.warning('一次上传不能超过8张哦~');
                        } else {

                            let filePromises = [];

                            for(var i = 0;i < fileLength;i++) {

                                let file = fileList[i];
                                let isJPG = (file.type === 'image/jpg' || file.type === 'image/png' || file.type === 'image/jpeg');
                                let isLt2M = file.size / 1024 / 1024 < 2;

                                if (!isJPG) {
                                    this.$Message.error('上传图片只能是 JPG/JPEG/PNG 格式!');
                                    return false
                                }
                                if (!isLt2M) {
                                    this.$Message.error('上传图片每张大小不能超过 2MB!');
                                    return false
                                }

                                if(isJPG && isLt2M) {

                                    let image = new FormData();
                                    image.append('file', fileList[i]);

                                    let filePromise = axios.post('files-upload?libraryId=picture_management', image, { headers: { "Content-Type": "multipart/form-data"}}).then(response => {

                                        let res = response.data;
                                        if(!res.success) {
                                            this.$Message.warning(res.message)
                                        } else {

                                            if(this.noPic) this.noPic = false;

                                            // let fileItem = {
                                            //     oid: res.data.oid,
                                            //     imgWidth: 0,
                                            //     imgHeight: 0,
                                            //     cname: res.data.cname,
                                            //     note: ''
                                            // }

                                            // var _self = this;
                                            // if(window.FileReader) {

                                            //     var fr = new FileReader();

                                            //     fr.onloadend = function(e) {

                                            //         _self.imgList.push(fileItem);

                                            //     };
                                            //     fr.readAsDataURL(file);

                                            // }

                                        }

                                    }).catch(e => {
                                        console.log(e);
                                    });
                                    filePromises.push(filePromise);

                                }

                            }

                            let self = this;
                            Promise.all(filePromises).then(res => {

                                self.spinShow = false;
                                // 解决 input file类型控件第二次上传同名文件没响应
                                event.target.value = '';
                                self.initImg(true, self.picIndexLabel, true);

                            })

                        }

                    }

                } else {                  // 上传图标

                }

            },

            /**
             * @description 确认选择图表合集 回传数据
            */
            confirmIcon() {

                this.iconModal = false;
                console.log(this.picIndexItem, this.picIndex)
                this.$emit("transferImg", this.picIndexItem, this.picIndex);

            }
        }
    }
</script>
<style scoped>
.img-content {
    position: relative;

}
.function-wrap {
    position: absolute;
    right: 0;
    top: -5px;
}
.imgWrap,
.iconWrap,
.noPicBox {
    width: 860px;
    height: 420px;
    margin-bottom: 20px;
    overflow-y: auto;
}
.noPicBox {
    text-align: center;
    font-size: 26px;
    color: #b7b7b7;
    padding-top: 100px;
}
.picItem {
    width: 120px;
    height: 146px;
    list-style: none;
    text-align: center;
    float: left;
    margin:  0 20px 20px 0;
}
.imgBox {
    position: relative;
    width: 120px;
    height: 120px;
}
.activeImg {
    border: 3px solid #2D8CF0;
}
.actFlag {
    position: absolute;
    top: 0;
    right: 0;
    width: 26px;
    height: 26px;
    background: #2D8CF0;
    color: #fff;
    display: none;
}
.actFlag i {
    font-size: 28px;
}
.activeImg .actFlag{
    display: block;
}
.picItem img {
    width: 100%;
    height: 100%;
}
.picTitle {
    width: 120px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
.fileImg {
    position: absolute;
    left: 0;
    top: 0;
  overflow: hidden;
    opacity: 0;
    width: 60px;
    height: 34px;
}
.fileImg:hover {
    cursor: pointer;
}
.iconItem {
    float: left;
    margin: 0 16px 10px 0;
    width: 120px;
    text-align: center;
    list-style: none;
    cursor: pointer;
    height: 100px;
    color: #5c6b77;
    transition: all .2s ease;
    position: relative;
    padding-top: 10px;
}
.iconItem i {
    font-size: 32px;
}
.viewMask {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 40px;
    height: 40px;
    line-height: 40px;
    background: rgba(0,0,0,.6);
}
.viewMask i {
    color: #fff;
    font-size: 26px;
    cursor: pointer;
}
.imgBox:hover .viewMask {
    display: block;
}
</style>
