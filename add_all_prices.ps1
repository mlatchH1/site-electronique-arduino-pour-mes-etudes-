# Script pour ajouter les prix à TOUS les composants
$content = Get-Content script.js -Raw

# Liste des composants avec prix
$components = @(
    @{id='rgb-strip-5050'; field='voltage'; price='8.00'; search='bande+led+rgb+5050'},
    @{id='hc-05'; field='voltage'; price='5.00'; search='hc-05+bluetooth+module'},
    @{id='nrf24l01'; field='voltage'; price='2.50'; search='nrf24l01+rf+2.4ghz'},
    @{id='lm7805'; field='voltage'; price='0.50'; search='lm7805+regulateur+5v'},
    @{id='ams1117-3v3'; field='voltage'; price='0.40'; search='ams1117+3.3v+regulateur'},
    @{id='tp4056'; field='voltage'; price='1.00'; search='tp4056+charge+batterie+lithium'},
    @{id='irf520'; field='voltage'; price='0.80'; search='irf520+mosfet'},
    @{id='2n2222'; field='voltage'; price='0.15'; search='2n2222+transistor+npn'},
    @{id='bc547'; field='voltage'; price='0.10'; search='bc547+transistor+npn'},
    @{id='1n4007'; field='voltage'; price='0.05'; search='1n4007+diode+rectification'},
    @{id='1n4148'; field='voltage'; price='0.05'; search='1n4148+diode+signal'},
    @{id='zener-5v1'; field='voltage'; price='0.10'; search='zener+5.1v+diode'},
    @{id='1n5819'; field='voltage'; price='0.15'; search='1n5819+diode+schottky'},
    @{id='2n2907'; field='voltage'; price='0.15'; search='2n2907+transistor+pnp'},
    @{id='tip120'; field='voltage'; price='0.60'; search='tip120+transistor+darlington'},
    @{id='bt136'; field='voltage'; price='0.50'; search='bt136+triac'},
    @{id='bt169'; field='voltage'; price='0.50'; search='bt169+triac'},
    @{id='pc817'; field='voltage'; price='0.30'; search='pc817+optocoupleur'},
    @{id='crystal-16mhz'; field='frequency'; price='0.50'; search='quartz+16mhz+crystal'},
    @{id='p6ke6v8'; field='voltage'; price='0.40'; search='p6ke6v8+tvs+diode'},
    @{id='mov-14d471k'; field='voltage'; price='0.60'; search='varistor+mov+470v'},
    @{id='polyfuse'; field='current'; price='0.30'; search='polyfuse+fusible+rearmable'},
    @{id='ds1307-rtc'; field='voltage'; price='2.00'; search='ds1307+rtc+horloge+temps+reel'},
    @{id='sd-card-module'; field='voltage'; price='2.50'; search='module+carte+sd+spi'},
    @{id='relay-module-1ch'; field='voltage'; price='2.00'; search='module+relais+1+canal'},
    @{id='step-down-lm2596'; field='voltage'; price='2.50'; search='lm2596+step+down+buck'},
    @{id='esp8266-01'; field='voltage'; price='3.00'; search='esp8266-01+wifi'},
    @{id='esp32-devkit'; field='voltage'; price='7.00'; search='esp32+devkit+wifi+bluetooth'},
    @{id='neo-6m-gps'; field='voltage'; price='12.00'; search='neo-6m+gps+module'},
    @{id='tft-1.8-st7735'; field='voltage'; price='8.00'; search='tft+1.8+st7735+ecran+couleur'},
    @{id='inductor-100uh'; field='inductance'; price='0.30'; search='inductance+100uh'},
    @{id='inductor-10mh'; field='inductance'; price='0.40'; search='inductance+10mh'},
    @{id='bpw34'; field='voltage'; price='1.00'; search='bpw34+photodiode'},
    @{id='l14g1'; field='voltage'; price='1.20'; search='l14g1+phototransistor'},
    @{id='mpu6050'; field='voltage'; price='3.00'; search='mpu6050+gyroscope+accelerometre'},
    @{id='pir-hc-sr501'; field='voltage'; price='2.00'; search='hc-sr501+pir+detecteur+mouvement'},
    @{id='28byj-48'; field='voltage'; price='3.00'; search='28byj-48+stepper+motor+uln2003'},
    @{id='74hc595'; field='voltage'; price='0.40'; search='74hc595+registre+decalage'},
    @{id='ne555'; field='voltage'; price='0.30'; search='ne555+timer+ic'},
    @{id='lm358'; field='voltage'; price='0.50'; search='lm358+ampli+op'},
    @{id='uln2003'; field='voltage'; price='0.60'; search='uln2003+driver+darlington'},
    @{id='lm393'; field='voltage'; price='0.40'; search='lm393+comparateur'},
    @{id='cd4017'; field='voltage'; price='0.50'; search='cd4017+compteur+decade'},
    @{id='lcd-16x2-i2c'; field='voltage'; price='4.50'; search='lcd+16x2+i2c+arduino'},
    @{id='oled-128x64'; field='voltage'; price='5.00'; search='oled+128x64+i2c+ssd1306'},
    @{id='7segment-4digit'; field='voltage'; price='2.50'; search='afficheur+7+segments+tm1637'},
    @{id='rfid-rc522'; field='voltage'; price='3.50'; search='rfid+rc522+13.56mhz'},
    @{id='rotary-encoder'; field='voltage'; price='1.50'; search='encodeur+rotatif+ky-040'}
)

foreach ($comp in $components) {
    $pattern = "(\s+id: '$($comp.id)',\s+name: '[^']+',\s+$($comp.field): '[^']+',\s+)"
    $replacement = "`$1price: $($comp.price),`n                buyLink: 'https://www.amazon.fr/s?k=$($comp.search)',`n                "
    
    # Vérifier si le prix existe déjà
    if ($content -notmatch "id: '$($comp.id)'[^}]+price:") {
        $content = $content -replace $pattern, $replacement
        Write-Host "✅ Prix ajouté à $($comp.id): $($comp.price)€" -ForegroundColor Green
    } else {
        Write-Host "✓ $($comp.id) a déjà un prix" -ForegroundColor Yellow
    }
}

$content | Set-Content script.js -Encoding UTF8
Write-Host "`n✅ TERMINÉ ! Tous les prix ont été ajoutés." -ForegroundColor Cyan
