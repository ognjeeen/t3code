# Desktop Workflow

Ovaj dokument opisuje preporučen tok rada za razvoj, lokalno pokretanje, build, instalaciju i naredna ažuriranja desktop aplikacije.

## Osnovno pravilo

- `origin` je tvoj fork.
- `upstream` je zvanični repo: `https://github.com/pingdotgg/t3code.git`
- `main` u svom fork-u držiš stabilnim i spremnim za release.
- Svaku izmenu radiš na posebnoj grani.
- Release i update kanal za desktop aplikaciju objavljuješ iz `main` grane svog forka.

## Prvi setup

1. Kloniraj svoj fork i uđi u repo:

```powershell
git clone <tvoj-fork-url>
cd t3code
```

2. Proveri remote-e:

```powershell
git remote -v
```

Treba da vidiš:

- `origin` -> tvoj fork
- `upstream` -> `https://github.com/pingdotgg/t3code.git`

Ako `upstream` ne postoji:

```powershell
git remote add upstream https://github.com/pingdotgg/t3code.git
git fetch upstream
```

3. Instaliraj dependency-je:

```powershell
bun install
```

## Svakodnevni razvoj

1. Sinhronizuj svoj `main` sa upstream-om:

```powershell
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

2. Napravi novu radnu granu:

```powershell
git checkout -b feat/t3m0-<kratak-opis>
```

3. Pokreni desktop u development modu:

```powershell
bun run dev:desktop
```

To je glavni način rada tokom razvoja. Ne pravi installer i ne zahteva instalaciju aplikacije na sistem.

## Validacija pre merge-a

Pre spajanja izmena pokreni:

```powershell
bun fmt
bun lint
bun typecheck
bun run test
```

Ako je sve u redu:

```powershell
git add .
git commit -m "..."
git push -u origin feat/t3m0-<kratak-opis>
```

Zatim:

- otvori PR iz te grane u `main` svog forka, ili
- merge-uj lokalno u `main` ako radiš solo i ne treba ti PR review

Preporuka je da i kao solo maintainer i dalje koristiš feature grane.

## Desktop bez instalera

Ako hoćeš da pokreneš buildovanu desktop aplikaciju lokalno, ali bez pravljenja instalera:

```powershell
bun run build:desktop
bun run start:desktop
```

## Windows installer

Ako hoćeš pravi lokalni installer za Windows:

```powershell
bun run build:desktop
bun run dist:desktop:win:x64
```

Za ARM:

```powershell
bun run dist:desktop:win:arm64
```

Očekuj artifact u `release/` folderu.

Primer naziva:

```text
T3M0-<verzija>-x64.exe
```

## Kako da proveriš koegzistenciju sa official app

1. Instaliraj official T3 Code.
2. Instaliraj svoj `T3M0` installer.
3. Proveri da se obe aplikacije vide odvojeno u Start meniju.
4. Proveri da obe mogu da se pokrenu nezavisno.
5. Proveri da `T3M0` koristi svoj user-data folder, a ne isti kao official app.

## Release workflow

Kada želiš novi desktop release:

1. Spoji izmene u `main` svog forka.
2. Pokreni validaciju:

```powershell
bun fmt
bun lint
bun typecheck
bun run test
```

3. Napravi Windows artifact:

```powershell
bun run dist:desktop:win:x64
```

4. Objavi artifact kao GitHub Release u svom fork repo-u.

Instalirani `T3M0` će update tražiti na GitHub Releases tvog forka, ne na upstream-u.

## Preporučen praktični tok

Za običnu izmenu:

```powershell
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
git checkout -b feat/neka-izmena

bun run dev:desktop
```

Kada završiš:

```powershell
bun fmt
bun lint
bun typecheck
bun run test
git add .
git commit -m "..."
git push -u origin feat/neka-izmena
```

Kada hoćeš release:

```powershell
git checkout main
git merge feat/neka-izmena
git push origin main

bun run dist:desktop:win:x64
```

Posle toga uploaduj artifact na GitHub Release svog forka.

## Kratka preporuka

- Nemoj gurati direktno na `main` osim za baš hitne i male izmene.
- Radi na feature grani.
- `main` drži uvek spremnim za release.
- Za razvoj koristi `bun run dev:desktop`.
- Installer pravi kada hoćeš realnu proveru instalacije ili novi release.
