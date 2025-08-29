
Sportelli Pianezza - Versione completa (locale)
-------------------------------------

Questa webapp gira in locale con Node.js e fornisce:
- Pagina "Totem" (index.html) per prendere il numero e stampare il biglietto con QR code.
- Pannello Admin (admin.html) per vedere le code e chiamare i numeri.
- Display pubblico (display.html) per mostrare i numeri in tempo reale.
- QR code generato lato server (pacchetto 'qrcode') - non serve accesso a internet.

Istruzioni:
1) Scompatta lo ZIP.
2) Da terminale nella cartella 'Sportelli':
   npm install
   npm start
3) Apri sui PC della rete locale (o lo stesso computer):
   http://<IP-del-computer>:8080/          -> Totem (index)
   http://<IP-del-computer>:8080/admin.html -> Pannello Operatore
   http://<IP-del-computer>:8080/display.html -> Display pubblico

Se vuoi esporre a tutta la rete locale, assicurati che il firewall permetta la porta 8080 e usa l'IP locale (es. 192.168.1.10:8080).


