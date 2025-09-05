
# Eliminacode Web – Sistema Gestione Code

App web completa per la gestione delle code con:
- **Monitor Sala** con annuncio audio
- **Totem** per prendere il numero con QR code
- **Operatore** per gestire le chiamate
- **Amministratore** per configurare uffici, prefissi e audio

## Avvio rapido
1. Installare Node.js (>=18)
2. Aprire un terminale nella cartella del progetto
3. Installare le dipendenze: `npm install`
4. Avviare: `npm start`
5. Aprire il browser su `http://localhost:3001`

## 🌐 Accesso remoto da altri PC

### Configurazione server
Per permettere l'accesso da altri dispositivi sulla rete locale:

1. **Trova l'indirizzo IP** del computer che esegue il server:
   - **Windows**: Apri `cmd` e digita `ipconfig`
   - **Mac/Linux**: Apri terminale e digita `ifconfig` o `ip addr show`
   - Cerca l'indirizzo IP della rete locale (es. 192.168.1.100)

2. **Verifica il firewall**: Assicurati che la porta 3001 sia aperta nel firewall

3. **Avvia il server** normalmente con `npm start`

### Collegamento da PC remoti
Da qualsiasi altro dispositivo sulla stessa rete WiFi/LAN:

- **Sostituisci `localhost`** con l'IP del server
- **Esempi di URL**:
  ```
  http://192.168.1.100:3001           # Home page
  http://192.168.1.100:3001/sala.html # Monitor sala
  http://192.168.1.100:3001/totem.html # Totem emissione numeri
  http://192.168.1.100:3001/ufficio.html # Pannello operatore
  http://192.168.1.100:3001/admin.html # Amministrazione
  ```

### Setup tipico multi-dispositivo
- **PC Server**: Esegue `npm start` e amministrazione
- **Monitor TV/Proiettore**: Visualizza `/sala.html` a schermo intero
- **Tablet Totem**: Usa `/totem.html` per emissione numeri
- **PC Operatori**: Accedono a `/ufficio.html` per gestire le code

### Risoluzione problemi connessione
- Verifica che tutti i dispositivi siano sulla **stessa rete WiFi**
- Controlla che il **firewall non blocchi** la porta 3001
- Prova a **disabilitare temporaneamente** il firewall per test
- Su Windows, potrebbe essere necessario consentire l'app tramite **Windows Defender**

## Pagine disponibili
- **Home**: `http://localhost:3001` - Pagina principale con accesso a tutti i pannelli
- **Monitor Sala**: `http://localhost:3001/sala.html` - Display per sala d'attesa
- **Totem**: `http://localhost:3001/totem.html` - Emissione numeri con QR code
- **Operatore**: `http://localhost:3001/ufficio.html` - Pannello operatore con selezione ufficio
- **Admin**: `http://localhost:3001/admin.html` - Configurazione sistema

## Password e accessi

### Amministratore
- Password predefinita: `tiziano`
- Dove si usa: schermata `/admin.html` mostra un login; dopo l'accesso compaiono i controlli di configurazione.
- Come cambiarla:
  1. Apri il file `public/js/admin.js`.
  2. Cerca la costante `ADMIN_PW`.
  3. Sostituisci il valore con la nuova password (es. `const ADMIN_PW = 'nuovaPassword';`).
  4. Salva e ricarica la pagina `/admin.html`.
- Logout: la sessione è memorizzata nel browser (localStorage). Per disconnettere, cancella la chiave `adminAuthed` del sito (da Impostazioni sito/Storage) o usa la pulizia dati del browser.

Nota: questa protezione è lato client, pensata per uso su rete locale. Per esigenze di sicurezza superiori, valutare un controllo lato server e HTTPS.

### Operatori (pannello Ufficio)
- Password per cambio operatore: salvate in `office_passwords.json` (default = nome ufficio).
- Come funziona: quando si cambia ufficio dal menu del pannello `/ufficio.html`, viene richiesto di inserire la password. La verifica avviene sul server confrontando con `office_passwords.json` (confronto non sensibile a maiuscole/minuscole, spazi, accenti o apostrofi).
- Come cambiarla: apri `office_passwords.json` e modifica il valore della chiave corrispondente all'`id` dell'ufficio (es. `{"anagrafe": "NuovaPassword"}`). Salva il file e ricarica la pagina.

## Funzionalità
- Gestione multiple uffici
- Generazione code per numeri emessi
- Anteprima e stampa biglietti
- Audio automatico con Web Speech API
- Interfaccia moderna e responsive

## Note tecniche
- Porta predefinita: **3001** (modificabile in server.js)
- Dati salvati in `data.json`
- Compatibile con tutti i browser

