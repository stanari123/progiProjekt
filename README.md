# Opis projekta

Ovaj projekt rezultat je timskog rada u sklopu projektnog zadatka kolegija [Programsko inženjerstvo](https://www.fer.unizg.hr/predmet/proinz) na Fakultetu elektrotehnike i računarstva Sveučilišta u Zagrebu.

Kako mnogi od nas žive u zgradama ili studentskim domovima, znamo da je teško komunicirati sa susjedima oko održavanja zajedničkog životnog prostora. Cilj našeg projekta je to olakšati na način da se komunikacija odvija na virtualnoj oglasnoj ploči. Svaki suvlasnik moći će otvoriti diskusiju, bilo javnu ili privatnu, i izjasniti se oko svojih problema vezanih uz zgradu. Potom se može otvoriti i glasanje u kontekstu diskusije, čime bi olakšali koordinaciju stanara u rješavanju zajedničkih problema (npr. obnova fasade, preuređenje zajedničkog prostora, energetske obnove...).

# Funkcijski zahtjevi

- serversko sučelje
- pokretanje diskusija, bilo javnih ili privatnih
	- inicijator može odrediti dodatne parametre diskusije i glasanja
	- sadržaj privatne diskusije dostupan je inicijatoru i skupini suvlasnika koju on odredi
		- postojanje privatne diskusije vidljivo je svima
	- dodavanje suvlasnika u listu sudionika pokreće slanje elektroničke pošte tom korisniku
- glasanje
	- biranje pozitivnog ili negativnog odgovora
	- ako broj pozitivnih glasova premašuje četvrtinu, iz glasovanja se može kreirati poziv za sastanak
- administratorske privilegije
	- kreiranje suvlasnika i predstavnika suvlasnika
- registracija i prijava preko servisa za autentifikaciju

# Tehnologije

NodeJS, Express, HTML, CSS, JavaScript, EJS

> Podložno dodatcima i promjenama.

# Članovi tima

Frontend:
- [Marko Vrkić](https://github.com/MarkoVr004)
- [Luka Zorić](https://github.com/LukaZ-25)
 
Baza podataka: 
- [Oleksandr Malik](https://github.com/sanos56)
- [Vinko Šapina](https://github.com/vinkosapina)

Backend:
- [Isa Trobradović](https://github.com/IsaTrobradovic)
- [Jakov Svalina](https://github.com/svalinovich)

Voditelj tima: [Vinko Šapina](https://github.com/vinkosapina)

# 📝 Kodeks ponašanja [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
Kao studenti sigurno ste upoznati s minimumom prihvatljivog ponašanja definiran u [KODEKS PONAŠANJA STUDENATA FAKULTETA ELEKTROTEHNIKE I RAČUNARSTVA SVEUČILIŠTA U ZAGREBU](https://www.fer.hr/_download/repository/Kodeks_ponasanja_studenata_FER-a_procisceni_tekst_2016%5B1%5D.pdf), te dodatnim naputcima za timski rad na predmetu [Programsko inženjerstvo](https://wwww.fer.hr).
Očekujemo da ćete poštovati [etički kodeks IEEE-a](https://www.ieee.org/about/corporate/governance/p7-8.html) koji ima važnu obrazovnu funkciju sa svrhom postavljanja najviših standarda integriteta, odgovornog ponašanja i etičkog ponašanja u profesionalnim aktivnosti. Time profesionalna zajednica programskih inženjera definira opća načela koja definiranju moralni karakter, donošenje važnih poslovnih odluka i uspostavljanje jasnih moralnih očekivanja za sve pripadnike zajenice.

Kodeks ponašanja skup je provedivih pravila koja služe za jasnu komunikaciju očekivanja i zahtjeva za rad zajednice/tima. Njime se jasno definiraju obaveze, prava, neprihvatljiva ponašanja te odgovarajuće posljedice (za razliku od etičkog kodeksa). U ovom repozitoriju dan je jedan od široko prihvačenih kodeks ponašanja za rad u zajednici otvorenog koda.
>### Poboljšajte funkcioniranje tima:
>* definirajte načina na koji će rad biti podijeljen među članovima grupe
>* dogovorite kako će grupa međusobno komunicirati.
>* ne gubite vrijeme na dogovore na koji će grupa rješavati sporove primjenite standarde!
>* implicitno podrazmijevamo da će svi članovi grupe slijediti kodeks ponašanja.

# 📝 Licenca
Važeča (1)
[![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

Ovaj repozitorij sadrži otvoreni obrazovni sadržaji (eng. Open Educational Resources)  i licenciran je prema pravilima Creative Commons licencije koja omogućava da preuzmete djelo, podijelite ga s drugima uz 
uvjet da navođenja autora, ne upotrebljavate ga u komercijalne svrhe te dijelite pod istim uvjetima [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License HR][cc-by-nc-sa].
>
> ### Napomena:
>
> Svi paketi distribuiraju se pod vlastitim licencama.
> Svi upotrijebleni materijali  (slike, modeli, animacije, ...) distribuiraju se pod vlastitim licencama.

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: https://creativecommons.org/licenses/by-nc/4.0/deed.hr 
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg

Orginal [![cc0-1.0][cc0-1.0-shield]][cc0-1.0]
>
>COPYING: All the content within this repository is dedicated to the public domain under the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication.
>
[![CC0-1.0][cc0-1.0-image]][cc0-1.0]

[cc0-1.0]: https://creativecommons.org/licenses/by/1.0/deed.en
[cc0-1.0-image]: https://licensebuttons.net/l/by/1.0/88x31.png
[cc0-1.0-shield]: https://img.shields.io/badge/License-CC0--1.0-lightgrey.svg

### Reference na licenciranje repozitorija
