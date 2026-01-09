import re

# Prix par défaut selon le type de composant
PRICES = {
    # LEDs et éclairage
    'ws2812b': (0.50, 'ws2812b+led+rgb+adressable'),
    'rgb-strip-5050': (8.00, 'bande+led+rgb+5050'),
    'matrix-8x8': (5.00, 'matrice+led+8x8+max7219'),
    
    # Interfaces
    'joystick-analog': (2.00, 'joystick+analogique+2+axes'),
    'keypad-4x4': (2.50, 'clavier+matriciel+4x4'),
    'rfid-rc522': (3.50, 'rfid+rc522+13.56mhz'),
    'rotary-encoder': (1.50, 'encodeur+rotatif+ky-040'),
    
    # Inductances
    'inductor-100uh': (0.30, 'inductance+100uh'),
    'inductor-10mh': (0.40, 'inductance+10mh'),
    
    # Capteurs
    'bpw34': (1.00, 'bpw34+photodiode'),
    'l14g1': (1.20, 'l14g1+phototransistor'),
    'mpu6050': (3.00, 'mpu6050+gyroscope+accelerometre'),
    'pir-hc-sr501': (2.00, 'hc-sr501+pir+detecteur+mouvement'),
    
    # Moteurs
    '28byj-48': (3.00, '28byj-48+stepper+motor+uln2003'),
    'l298n': (3.50, 'l298n+pont+h+moteur'),
    
    # Circuits intégrés
    '74hc595': (0.40, '74hc595+registre+decalage'),
    'ne555': (0.30, 'ne555+timer+ic'),
    'lm358': (0.50, 'lm358+ampli+op'),
    'uln2003': (0.60, 'uln2003+driver+darlington'),
    'lm393': (0.40, 'lm393+comparateur'),
    'cd4017': (0.50, 'cd4017+compteur+decade'),
    
    # Affichages
    'lcd-16x2-i2c': (4.50, 'lcd+16x2+i2c+arduino'),
    'oled-128x64': (5.00, 'oled+128x64+i2c+ssd1306'),
    '7segment-4digit': (2.50, 'afficheur+7+segments+tm1637'),
    
    # Communication
    'esp8266': (4.00, 'esp8266+wifi+module'),
    'hc-05': (5.00, 'hc-05+bluetooth+module'),
    'nrf24l01': (2.50, 'nrf24l01+rf+2.4ghz'),
    
    # Alimentation
    'lm7805': (0.50, 'lm7805+regulateur+5v'),
    'ams1117-3v3': (0.40, 'ams1117+3.3v+regulateur'),
    'tp4056': (1.00, 'tp4056+charge+batterie+lithium'),
    
    # Transistors et diodes
    'irf520': (0.80, 'irf520+mosfet'),
    '2n2222': (0.15, '2n2222+transistor+npn'),
    'bc547': (0.10, 'bc547+transistor+npn'),
    '1n4007': (0.05, '1n4007+diode+rectification'),
    '1n4148': (0.05, '1n4148+diode+signal'),
    'zener-5v1': (0.10, 'zener+5.1v+diode'),
    '1n5819': (0.15, '1n5819+diode+schottky'),
    '2n2907': (0.15, '2n2907+transistor+pnp'),
    'tip120': (0.60, 'tip120+transistor+darlington'),
    'bt136': (0.50, 'bt136+triac'),
    'bt169': (0.50, 'bt169+triac'),
    'pc817': (0.30, 'pc817+optocoupleur'),
    'crystal-16mhz': (0.50, 'quartz+16mhz+crystal'),
    'p6ke6v8': (0.40, 'p6ke6v8+tvs+diode'),
    'mov-14d471k': (0.60, 'varistor+mov+470v'),
    'polyfuse': (0.30, 'polyfuse+fusible+rearmable'),
    
    # Modules
    'ds1307-rtc': (2.00, 'ds1307+rtc+horloge+temps+reel'),
    'sd-card-module': (2.50, 'module+carte+sd+spi'),
    'relay-module-1ch': (2.00, 'module+relais+1+canal'),
    'step-down-lm2596': (2.50, 'lm2596+step+down+buck'),
    
    # IoT
    'esp8266-01': (3.00, 'esp8266-01+wifi'),
    'esp32-devkit': (7.00, 'esp32+devkit+wifi+bluetooth'),
    'neo-6m-gps': (12.00, 'neo-6m+gps+module'),
    'tft-1.8-st7735': (8.00, 'tft+1.8+st7735+ecran+couleur'),
}

def add_price_to_component(content, component_id, price, search_term):
    """Ajoute price et buyLink à un composant"""
    # Pattern pour trouver le composant
    pattern = rf"(\s+id: '{component_id}',\s+name: '[^']+',\s+)"
    
    # Chercher le composant
    match = re.search(pattern, content)
    if not match:
        print(f"❌ Composant {component_id} non trouvé")
        return content
    
    # Vérifier s'il a déjà un prix
    start_pos = match.start()
    # Chercher les 500 caractères suivants
    next_chunk = content[start_pos:start_pos+500]
    if 'price:' in next_chunk:
        print(f"✓ {component_id} a déjà un prix")
        return content
    
    # Trouver où insérer (après le 2e ou 3e champ)
    # Pattern: après voltage/interface/type/autre mais avant symbole
    insert_pattern = rf"(id: '{component_id}',\s+name: '[^']+',\s+(?:voltage|interface|type|steps|outputs|frequency|wavelength|current|range|accuracy|torque|angle|inductance|resistance|channels|bandwidth|slew): '[^']+',\s+)"
    
    insert_match = re.search(insert_pattern, content)
    if insert_match:
        insert_pos = insert_match.end()
        # Insérer price et buyLink
        price_line = f"price: {price:.2f},\n                buyLink: 'https://www.amazon.fr/s?k={search_term}',\n                "
        content = content[:insert_pos] + price_line + content[insert_pos:]
        print(f"✅ Prix ajouté à {component_id}: {price}€")
    else:
        print(f"⚠️ Pattern d'insertion non trouvé pour {component_id}")
    
    return content

# Lire le fichier
with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Ajouter les prix
for comp_id, (price, search) in PRICES.items():
    content = add_price_to_component(content, comp_id, price, search)

# Sauvegarder
with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ TERMINÉ ! Tous les prix ont été ajoutés.")
