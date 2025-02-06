## appunti
- conviene sempre fare un progetto con **AppRouter** (moderno) invece che PagesRouter
- c'è una gerarchia di discendenza delle proprietà di alcuni file specifici di  Next, tra cui `layout.tsx` e `loading.tsx`
- i **server component** sono recenti e permettono di evitarsi uno strato di API sul server facendo chiamate server side direttamente all'interno del codice sorgente frontend. supportano async await e non necessitano di useEffect o useState (come fosse uno strato api stateless!). non sono manipolabili dal client e sono default su next
- libreria **postgres.js** per db contiene protezioni vs iniezioni sql
- col **dynamic rendering**, l'app è in realtà veloce quanto i tuoi dati più lenti a fetchate (effetto collaterale delle **Network waterfall**)
- il metodo più semplice di fare ***CONTENT STREAMING*** è con **loading.tsx**, è un file di Next fatto sulla base di React Suspense (che sono boundaries, 'limiti' liberi tra frontend e server, o anche con db). Crea una UI di fallback finché il page content non è caricato, ma è full page. Essenzialmente in realtà applica un Suspense su tutta la parte dinamica della pagina
  - i componenti statici invece appaiono e sono interagibili da subito
    - l'utente può navigare tra pagine senza attendere il caricamento della pagina (**uninterruptable navigation**)
  - altro metodo: **streaming granulare** con **Suspense**
- **routing groups** per creare *contesti limitanti*
-  it's good practice to move your data fetches down to the components that need it, and then wrap those components in Suspense (se l'app non lo richiede troppo va benissimo invece fare streaming poco diversificato oppure solo per poche cose)
-  in Next.js, if you call a dynamic function in a route (like querying your database), the entire route becomes dynamic.
-  anche il Partial Prerendering sfrutta Suspense per fare defer finché non c'è una cond
   -  wrappare un component con Suspense non lo rende dinamico per sé, ma il Suspense crea una barriera tra la parte dinamica e statica del codice eseguito
   -  va enablato nel `next.config.mjs`
   -  aggiungere `export const experimental_ppr = true;` al layout.tsx della parte che si desidera sia PPR
   -  il miglioramento si nota in produzione tendenzialmente
-  **debouncing**, ad un event (tipo keystroke), parte un timer, si resetta ogni volta che viene rifatto l'event, quando scade, parte la funzione necessaria (ovvero quello che solitamente sarebbe stato l'handler)
   -  utile per, ad esempio, non querare il server ad ogni singolo keystroke dell'utente se si vuole una modalità di search automatizzata per dei dati, aspettando quindi che l'utente smetta di scrivere prima di richiedere invece di mandare richieste ad ogni tasto premuto (`use-debounce` è una libreria rapida e utile per implementarlo senza una funzione di debouncing custom con la funz useDebouncedCallback) \[molto simile ad un setTimeOut come implementazione]
- le fetch, se non ho uno strato API, vanno evitate a tutti i costi nei client component (espone dati PRIVATI a tutti, anche accessi al db stesso) e devono accadere solo in server component nel caso siano svolte direttamente dal frontend e non da un API
- le **Server Action di React** eseguono codice asincrono direttamente sul server, eliminando il bisogno di endpoint per mutare i dati, con funzioni evocabili dal client o dai server component (immagino meglio questi ultimi)
- esempio di server component che invoca una server action
    ```tsx
        // Server Component
    export default function Page() {
      // Action
      async function create(formData: FormData) {
        'use server'; // serve a spostarsi di boundary a serverside
    
        // Logic to mutate data...
      }
    
      // Invoke the action using the "action" attribute
      return <form action={create}>...</form>;
    }
    ```
    vantaggio? il form funziona anche mentre js non ha ancora caricato!

    e in Next puoi rivalidare i dati di cache associati automaticamente con API come `revalidatePath` e `revalidateTag` 
- `'use server;'` è una direttiva React che:
  - marca tutte le funzioni esportate dal file come Server Actions, importabili poi nei component Client e Server. quelle inutilizzate vengono rimosse nella build
  - si può fare direttamente all'interno dei server component scrivendolo dentro all'azione (tipo prima di un return con una query) 
  - è meglio fare in un file separato ed organizzato però, come un service
- librerie per validazione dei tipi per i form! Zod è ts first e l'ho usata
- nextjs ha una cache di routing clientside che tiene i segmenti della route nel browser, che assieme al prefetching, fa navigare più velocemente in percorsi noti e diminuisce le richieste al server
  - a volte per updatare i dati displayati in una route, si deve pulire la cache e far partire una nuova richiesta al server con revalidatePath
- `(foldername)` per creare divisioni gerarchiche tra component e impedire quindi di far ereditare cose che non voglio a quelli sottostanti al di fuori della folder
- `[paramnamefolder]` per creare route dinamiche (invece di query tipo user/id?=UUID/edit avrò user/UUID/edit) 
- per modificare i dati non posso passare un id come argomento nell'evento, ma devo passarlo come js .bind action
- mettiamo operazioni CRUD (soprattutto C e U) in blocchi try catch
- gestiamo gli errori in produzione con l'error.tsx, ma è un catch-all generico
  - *DEVE* essere componente **clientside**
  - possiamo averne uno per route
  - accetta 2 prop:
    - `error` (istanza di Error)
    - `reset`, funzione per resettare la boundary di errore, ovvero quando parte prova a rirenderizzare il segmento attuale della route (tipico del btn riprova)
- però per gestire risorse non trovate usiamo la libreria `notFound` per i 404
  - anche perché mettere un riprova in un 404 sarebbe inutile, mettiamo un go back
  - per evitare la schermata default next.js creare un not-found.tsx nella route che si vuole coprire
- la comodità di notFound è che questo errore ha automaticamente precedenza su error.tsx rispetto ad uno custom, mentre normalmente sarebbe da gestire
- un linter ti avvisa di elementi non semantici o attributi di accessibilità mancanti
- senza validazione dei form, parte error.tsx obv
- per l'**Auth** della web app si può usare **NextAuth.js** come libreria, rimuove molta complessità e unifica le soluzioni, comando install: `pnpm i next-auth@beta`, la beta è compatibile con le versioni di Next.js 14+
- genera una secret key con `https://generate-secret.vercel.app/32` su browser (per criptare i cookie) da mettere nel `.env` aggiungendo AUTH_SECRET='chiave'
  - per l'auth in production si devono aggiungere variabili d'ambiente su Vercel [così](https://vercel.com/docs/projects/environment-variables)
  - in un file `auth.config.ts` configurazione dell'auth con next-auth
  - in un file `middleware.ts` il callback dell'`auth.config.ts` che evita il rendering prima della verifica auth nelle route dettate col matcher e il config
    - adesso tentando di andare in pagine non autorizzate (come una dashboard) si viene rimandati alla pagina login ma con una stringa strana dopo (e fallisce obv)
- **Metadata**, nextjs permette di aggiungerli con una sua API in due modi:
  - *Config-based*: esportando un oggetto statico `metadata` o una funzione `generateMetadata` dinamica in file layout.tsx(fa ereditare i metadati nella route o nel contesto) o in page.tsx
    - come? importando Metadata e esportando una costante metadata di tipo Metadata, un ogg di config con dentro info come title, description, e poi anche metadataBase ()
  - *File-based*: file specifici usati per motivi di metadata:
    - favicon.ico, apple-icon.jpg e icon.jpg (vanno nella root di /app)
    - opengraph-image.jpg e twitter-image.jpg
    - robots.txt
    - sitemap.xml
  - Puoi usare i file col file-based oppure generare tutto tu, e next li prende per generare gli `<head>` per ogni pagina

# COSE EXTRA IMPORTANTI
- ### **ROUTING PARALLELO E CONDIZIONALE**:
  - scrivendo `/@folder` si creano route **parallele**, basta che le porto come prop al layout superiore per averle in page simultaneamente. Senza ulteriori modifiche si hanno due page.tsx che displayano nella stessa pagina
  ```tsx
  export default function Layout({sx, dx}: Props) {
    return (
      <div>
        <div className='pageSx'>{sx}</div>
        <div className='pageDx'>{dx}</div>
      </div>
    )
  }
  ```
    sennò si possono visualizzare condizionalmente, utile nelle dashboard tipo con un login (non qui)
    ```tsx
    export default function Layout({sx, dx}: Props) {
      return (
        <div>
          {sxMode ? sx : dx}
        </div>
      )
    }
    ```
    e che me ne faccio?
    **PATTERN PER MODALI**

    con funzionalità che sarebbero complesse da implementare:
    - il contenuto della modale diventa **condivisibile tramite url**
    - il contesto viene mantenuto, **al refresh la modale può rimanere aperta**
    - **navigando indietro la modale viene chiusa** invece di riportare alla route precedente
    - e di conseguenza **navigando in avanti nel** caso, **si riapre** la modale! (un po' come la navigazione a strati da mobile)
- ### **INTERCETTAZIONE DELLE ROUTE**:
  - Permette di caricare una route da un'altra parte della webapp nel layout attuale!
    - a che mi serve? immagina usarlo con una route dinamica immessa in una sua figlia (ie: mostrare la user card a lato di una sezione di setting specifica dello user, senza dover riportare tutti i dati di nuovo)
  - scrivendo puntini tra parentesi prima di una folder, si possono 'matchare' route in base alla posizione, i puntini rappresentando praticamente i cd di directory
    - (.) to match segments on the same level
    - (..) to match segments one level above
    - (..)(..) to match segments two levels above
    - (...) to match segments from the root app directory

## domande
1. capitolo 7 sul fetching (**RISOLTO**)
  - durante il DIY per il fetching dei data delle card, seguendo esattamente le istruzioni, svolgendolo e poi vedendo che il risultato mio era identico alla risposta nascosta, sembrerebbe esserci un problema a monte nella query sql o un edge case, perché compare sempre 1 come valore nel div delle total invoice e dei total customers
    - risolto, la libreria sql usata ritorna con COUNT (*) un valore `[{ count: '42' }]`, non solo un oggetto, si doveva innestare una volta in più nella query
2. capitolo 14:
  - il div che displaya l'error dell'amount non funziona (e nemmeno l'aria) anche se la logica è la stessa di quello prefatto, anche se adattata all'handling dell'amount invece del customer
3. capitolo 15:
  - non trovo una migration guide da nextauthjs ad authjs, ma leggendo il set up, per il sign in, bisogna wrappare il form e mapparlo con argomento i provider: ma io nell'esercizio ho l'array dei provider vuoto
  - signIn è una funzione client che viene chiamata da server, ho provato ad usare use client, ho provato a fare un file separato per authenticate, poi ho provato a fare un file helper per una callback che lo richiamasse, ma signin continua a dare problemi