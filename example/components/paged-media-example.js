import React from 'react';
import { Divider, BemTags } from '../../src/';

export default function PagedMediaExample(props) {
  const bem = BemTags();
  return (
    <div className={bem`paged-media-example`}>
      <div className={bem`__pages-grid-layout`}>
        <div className={bem`__header`}>header</div>
        <div className={bem`__space-filler`}>Filler</div>
        <div className={bem`__content`}>
          <div className={bem`__margin`}>margin</div>
          <p className={bem`__child`}>
            "Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
            aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
            eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est,
            qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit,
            sed quia non numquam eius modi tempora incidunt ut labore et dolore
            magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis
            nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut
            aliquid ex ea commodi consequatur? Quis autem vel eum iure
            reprehenderit qui in ea voluptate velit esse quam nihil molestiae
            consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla
            pariatur?"
          </p>
        </div>
        <div className={bem`__content`}>
          <div className={bem`__margin`}>margin</div>
          <p className={bem`__child`}>
            "Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
            aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
            eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est,
            qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit,
            sed quia non numquam eius modi tempora incidunt ut labore et dolore
            magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis
            nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut
            aliquid ex ea commodi consequatur? Quis autem vel eum iure
            reprehenderit qui in ea voluptate velit esse quam nihil molestiae
            consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla
            pariatur?"
          </p>
        </div>
        <div className={bem`__space-filler`}>Filler</div>
        <div className={bem`__content`}>
          <div className={bem`__margin`}>margin</div>
          <p className={bem`__child`}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras
            vestibulum faucibus sodales. Sed a mi vitae risus tincidunt
            porttitor in at ex. Sed nibh lacus, elementum ut libero at,
            facilisis finibus orci. Vestibulum ante ipsum primis in faucibus
            orci luctus et ultrices posuere cubilia Curae; Integer quis ligula
            massa. Nam tristique justo non arcu eleifend fringilla quis ut nibh.
            Sed vel ex porttitor, ornare eros feugiat, iaculis nibh. Vestibulum
            in lacus eleifend, fringilla nunc venenatis, egestas mauris. Donec
            luctus tortor nec massa consectetur vehicula. Pellentesque vulputate
            eget urna eget fringilla. Pellentesque dui arcu, ultricies vel neque
            ac, semper scelerisque lacus. Aenean suscipit velit nulla, eget
            vestibulum ex pharetra eu. Phasellus sed lacus dapibus, posuere nisl
            quis, consectetur enim. Proin ut tellus finibus, ultricies enim sit
            amet, vestibulum odio. Integer et velit nisi. Cras eu felis ornare,
            consequat orci eu, condimentum diam. Vestibulum nibh quam, tincidunt
            at efficitur ac, varius eget tortor. Pellentesque habitant morbi
            tristique senectus et netus et malesuada fames ac turpis egestas.
            Duis sit amet lacus posuere, tincidunt magna quis, tincidunt mi.
            Integer porttitor metus eu commodo bibendum. Donec cursus augue
            ligula, eget cursus mauris lobortis sed. Morbi placerat odio
            aliquam, malesuada nibh sit amet, eleifend tellus. Fusce ac augue id
            quam dapibus aliquam sed at metus. Vestibulum ultrices facilisis
            semper. Nunc eget elit feugiat nisi sodales posuere quis et odio.
            Phasellus ac feugiat eros. Donec vitae augue euismod, ornare leo
            non, luctus nulla. Curabitur mattis arcu sem, at rutrum est volutpat
            et. Cras in tempor lectus, ut ultrices neque. Nam molestie, dui id
            euismod efficitur, nunc turpis ullamcorper leo, vulputate eleifend
            felis nibh in nisl. Praesent commodo magna in aliquam vulputate.
            Nulla fringilla magna vel lacus pretium placerat. Sed accumsan
            condimentum purus. Cras vitae felis id libero vehicula congue sit
            amet eu purus. Duis sapien tellus, ornare id suscipit auctor,
            imperdiet ac ante. Suspendisse consectetur nisl et dolor elementum
            viverra. Curabitur eu ligula viverra, gravida justo sed, ultrices
            augue. Donec vitae erat finibus, tempor tortor et, tincidunt massa.
            Cras elementum ornare mi. Integer imperdiet tellus ullamcorper nibh
            consequat consequat. Quisque dolor odio, malesuada in condimentum
            laoreet, ultrices sit amet lorem. Quisque consequat quam id ipsum
            rhoncus, vitae tincidunt nulla varius. Maecenas pharetra laoreet
            lorem accumsan facilisis. Fusce pharetra viverra tellus sit amet
            faucibus. In efficitur scelerisque blandit. Sed viverra tristique
            urna, nec pretium diam facilisis at. Nullam sit amet ex ac eros
            faucibus fringilla. Vivamus posuere arcu et libero rutrum, et varius
            purus molestie. Etiam eu orci dui. Nulla at maximus est, sed
            eleifend ex.
          </p>
        </div>
        <div className={bem`__content`}>
          <div className={bem`__margin`}>table margin</div>
          <table className={bem`__table`}>
            <caption>
              Data about the planets of our solar system (Planetary facts taken
              from{' '}
              <a href="http://nssdc.gsfc.nasa.gov/planetary/factsheet/">
                Nasa's Planetary Fact Sheet - Metric
              </a>).
            </caption>
            <colgroup>
              <col span={2} />
              <col style={{ border: '2px solid black' }} />
            </colgroup>
            <thead>
              <tr>
                <td colSpan={2} />
                <th scope="col">Name</th>
                <th scope="col">
                  Mass (10<sup>24</sup>kg)
                </th>
                <th scope="col">Diameter (km)</th>
                <th scope="col">
                  Density (kg/m<sup>3</sup>)
                </th>
                <th scope="col">
                  Gravity (m/s<sup>2</sup>)
                </th>
                <th scope="col">Length of day (hours)</th>
                <th scope="col">
                  Distance from Sun (10<sup>6</sup>km)
                </th>
                <th scope="col">Mean temperature (°C)</th>
                <th scope="col">Number of moons</th>
                <th scope="col">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th rowSpan={4} colSpan={2} scope="rowgroup">
                  Terrestial planets
                </th>
                <th scope="row">Mercury</th>
                <td>0.330</td>
                <td>4,879</td>
                <td>5427</td>
                <td>3.7</td>
                <td>4222.6</td>
                <td>57.9</td>
                <td>167</td>
                <td>0</td>
                <td>Closest to the Sun</td>
              </tr>
              <tr>
                <th scope="row">Venus</th>
                <td>4.87</td>
                <td>12,104</td>
                <td>5243</td>
                <td>8.9</td>
                <td>2802.0</td>
                <td>108.2</td>
                <td>464</td>
                <td>0</td>
                <td />
              </tr>
              <tr>
                <th scope="row">Earth</th>
                <td>5.97</td>
                <td>12,756</td>
                <td>5514</td>
                <td>9.8</td>
                <td>24.0</td>
                <td>149.6</td>
                <td>15</td>
                <td>1</td>
                <td>Our world</td>
              </tr>
              <tr>
                <th scope="row">Mars</th>
                <td>0.642</td>
                <td>6,792</td>
                <td>3933</td>
                <td>3.7</td>
                <td>24.7</td>
                <td>227.9</td>
                <td>-65</td>
                <td>2</td>
                <td>The red planet</td>
              </tr>
              <tr>
                <th rowSpan={4} scope="rowgroup">
                  Jovian planets
                </th>
                <th rowSpan={2} scope="rowgroup">
                  Gas giants
                </th>
                <th scope="row">Jupiter</th>
                <td>1898</td>
                <td>142,984</td>
                <td>1326</td>
                <td>23.1</td>
                <td>9.9</td>
                <td>778.6</td>
                <td>-110</td>
                <td>67</td>
                <td>The largest planet</td>
              </tr>
              <tr>
                <th scope="row">Saturn</th>
                <td>568</td>
                <td>120,536</td>
                <td>687</td>
                <td>9.0</td>
                <td>10.7</td>
                <td>1433.5</td>
                <td>-140</td>
                <td>62</td>
                <td />
              </tr>
              <tr>
                <th rowSpan={2} scope="rowgroup">
                  Ice giants
                </th>
                <th scope="row">Uranus</th>
                <td>86.8</td>
                <td>51,118</td>
                <td>1271</td>
                <td>8.7</td>
                <td>17.2</td>
                <td>2872.5</td>
                <td>-195</td>
                <td>27</td>
                <td />
              </tr>
              <tr>
                <th scope="row">Neptune</th>
                <td>102</td>
                <td>49,528</td>
                <td>1638</td>
                <td>11.0</td>
                <td>16.1</td>
                <td>4495.1</td>
                <td>-200</td>
                <td>14</td>
                <td />
              </tr>
              <tr>
                <th colSpan={2} scope="rowgroup">
                  Dwarf planets
                </th>
                <th scope="row">Pluto</th>
                <td>0.0146</td>
                <td>2,370</td>
                <td>2095</td>
                <td>0.7</td>
                <td>153.3</td>
                <td>5906.4</td>
                <td>-225</td>
                <td>5</td>
                <td>
                  Declassified as a planet in 2006, but this{' '}
                  <a href="http://www.usatoday.com/story/tech/2014/10/02/pluto-planet-solar-system/16578959/">
                    remains controversial
                  </a>.
                </td>
              </tr>
            </tbody>
          </table>

          <div className={bem`__margin`}>margin</div>
        </div>
        <div className={bem`__content`}>
          <div className={bem`__margin`}>margin</div>
          <p className={bem`__child`}>
            Aenean metus ante, blandit eget varius at, tempor a lectus. Nam
            cursus eros eros, eget congue sem condimentum id. Integer eu leo
            quam. Integer quis enim blandit, ultrices tortor sit amet,
            consectetur metus. Fusce tincidunt augue in nisi scelerisque
            elementum. Donec a tellus semper, scelerisque lorem in, dapibus
            erat. Nunc interdum, risus at convallis aliquet, tellus tortor
            rhoncus tellus, at dictum tortor sem at odio. Duis quis magna
            porttitor, consequat mauris maximus, volutpat nunc. Cras quis
            suscipit massa, et ullamcorper arcu. Praesent dapibus sapien at
            justo rutrum, a bibendum velit vehicula. Aliquam aliquet lobortis
            pulvinar. Pellentesque gravida nibh mi, et faucibus nisi egestas
            quis. Fusce mollis est in luctus porta. Vivamus a vulputate ipsum,
            at eleifend nisl. Donec hendrerit, dui ac semper hendrerit, neque
            purus elementum orci, in tempor magna risus eu risus. Vestibulum id
            lobortis est. Integer id ullamcorper neque. Quisque dictum, orci
            eget ultrices congue, tellus lectus mattis quam, eget imperdiet
            turpis lectus non tellus. Vestibulum viverra, metus a placerat
            vehicula, purus nulla rhoncus tortor, nec tristique metus nulla sit
            amet orci. Donec ut lacus fermentum, facilisis erat vel, lobortis
            metus. Donec vitae dolor sit amet diam bibendum imperdiet. Quisque
            convallis lacus at mauris cursus, non sagittis mi lacinia. Aenean ut
            neque sed lacus pellentesque placerat vel ac arcu. Curabitur lacinia
            cursus congue. Maecenas suscipit varius diam in finibus. Praesent
            congue facilisis nisi in dignissim. Vestibulum et nunc arcu. Proin
            et consequat mi, posuere hendrerit tortor. Etiam ante tellus,
            facilisis nec viverra eget, feugiat nec metus. Integer et aliquet
            sapien. Vivamus malesuada odio sed est iaculis dapibus. Maecenas
            egestas accumsan laoreet. Fusce et quam tortor. Sed sit amet erat
            quis odio ullamcorper auctor. Sed cursus ut sem at venenatis. Donec
            finibus risus lectus, sed sagittis tellus molestie a. Aliquam in
            felis dictum nisl facilisis scelerisque. Curabitur a ultrices urna.
            Donec eget maximus dui. Donec porta cursus leo, et suscipit lacus.
            Vestibulum malesuada gravida cursus. Donec condimentum neque lorem,
            nec hendrerit dolor iaculis quis. Suspendisse consequat felis
            tortor, id mollis sapien consequat eu. Vivamus vitae ex venenatis,
            sagittis magna in, lobortis nisl. Duis eu lorem lacus. Maecenas eget
            libero odio. Ut pretium mauris quis nunc tincidunt, vel venenatis
            leo ullamcorper. Sed placerat metus id turpis venenatis auctor.
            Quisque aliquet in dolor non interdum. Curabitur tempus eu lectus
            sit amet accumsan. Etiam gravida arcu magna, sit amet commodo lectus
            euismod at. Mauris mollis tincidunt erat et tempus. Integer congue
            arcu in ligula molestie pulvinar. Nunc congue blandit augue id
            condimentum. In hendrerit id magna eu lacinia. Cras tempor vehicula
            sem quis pretium. Nam facilisis ornare augue in tincidunt. In
            lobortis felis dolor. Praesent quis lacinia eros. Sed dui ante,
            venenatis vitae hendrerit vitae, accumsan ut nibh. Nullam convallis
            tortor quam, a auctor mi pulvinar ut. Nullam felis lacus, facilisis
            vel nibh in, pulvinar laoreet magna. Nam condimentum semper nulla,
            id posuere dui imperdiet in. Nulla facilisi. Ut cursus augue ut
            metus maximus luctus. Praesent at libero at dui molestie
            condimentum. Sed ullamcorper gravida eleifend. Duis lorem dui,
            bibendum ut condimentum at, condimentum vitae urna. Aliquam iaculis
            auctor odio. Nullam nulla nunc, dictum et elit eu, accumsan
            elementum tortor. Phasellus ut sagittis est. Quisque laoreet dolor
            quis dictum feugiat. Suspendisse interdum aliquam eros in sodales.
            Mauris in eleifend diam, sed iaculis tortor. Nam in sem quis mauris
            posuere fringilla. Sed tortor mi, gravida a laoreet vel, consectetur
            tincidunt enim. Mauris ac ante nec diam euismod tincidunt. Sed
            placerat quam a ipsum maximus, at egestas nibh venenatis. Phasellus
            felis lacus, dictum ut arcu nec, interdum varius ipsum. Nunc aliquam
            dolor velit, vel porta lectus pellentesque sit amet. Curabitur
            malesuada sem eros, sit amet vehicula leo vestibulum a. Aliquam
            tristique at enim eget finibus. Donec vel posuere tellus. Aenean
            placerat, enim id consequat fringilla, quam nulla fermentum leo, et
            interdum sem orci ut enim. Integer at elementum ante, vitae interdum
            ligula. Duis convallis augue at mauris ornare, luctus rutrum urna
            consectetur. Morbi malesuada accumsan aliquam. Sed dignissim elit
            nec quam luctus, a vestibulum neque condimentum. In sed dolor quis
            purus finibus rhoncus eu rhoncus diam. Mauris sit amet euismod
            felis. Praesent posuere ex sit amet dolor eleifend iaculis. Sed
            consectetur quis lacus at facilisis. Curabitur condimentum varius
            purus, id condimentum lectus dapibus ut. Aliquam erat volutpat. Nunc
            suscipit, nibh sit amet aliquet mattis, mi tellus tristique enim,
            sed tincidunt dui metus sit amet ipsum. Vestibulum sit amet accumsan
            quam. Nulla consectetur condimentum iaculis. Sed vulputate, nisl
            vitae bibendum varius, dui risus euismod augue, quis tempor elit
            risus vitae eros. Aliquam pharetra velit quis dui viverra, ut
            gravida leo egestas. Nunc scelerisque nisl ut euismod tincidunt.
            Donec tempor dolor odio, sit amet tempus tellus malesuada a.
            Vestibulum id tincidunt tellus, eget fringilla nunc. Curabitur sit
            amet varius elit. Quisque molestie laoreet hendrerit. Vestibulum
            ornare in diam et vulputate. Etiam vel neque velit. Aenean imperdiet
            eget dui vel consequat. In a tortor quam. Aliquam eget purus leo.
            Quisque lectus tortor, commodo a erat eu, mollis congue tortor.
            Etiam sit amet diam vulputate, consectetur nulla a, tincidunt
            ligula. Duis nisi arcu, feugiat in quam et, laoreet vulputate diam.
            Cras vitae rutrum risus, a interdum ipsum. Maecenas quis tincidunt
            justo. Pellentesque posuere efficitur quam, et maximus diam varius
            vitae. Vivamus ac massa erat. Praesent posuere vehicula sem
            consequat viverra. Maecenas ultrices sapien vitae dignissim
            tincidunt. Ut tincidunt enim sed venenatis bibendum. Phasellus at
            mollis velit. Sed malesuada arcu et nisi scelerisque, id pulvinar
            ante fermentum. Fusce nunc ante, sagittis ac blandit vitae, semper
            vitae eros.
          </p>
        </div>
      </div>
    </div>
  );
}
