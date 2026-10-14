import Image from 'next/image';
import Link from 'next/link';

const problems = [
  {
    title: 'Vienas modelis – dešimt pavadinimų',
    text: 'Kiekvienas pardavėjas modelį užrašo savaip: „fuji xt3“, „Fujifilm XT-3“, „X T3 kamera“. Paieška šių variantų nesusieja, todėl ieškodami „X-T3“ nerandate pusės skelbimų.',
  },
  {
    title: 'Trūksta to, kas svarbiausia',
    text: 'Skelbime dažniausiai tik nuotrauka ir kaina. Kiek užrakto paspaudimų, ar viskas veikia, ar yra kroviklis ir dėžutė – apie tai tenka klausinėti žinutėmis.',
  },
];

const differences = [
  {
    title: 'Modelis iš katalogo',
    text: 'Pardavėjas pasirenka modelį iš sąrašo, o ne rašo pavadinimą. Visi to paties fotoaparato skelbimai atsiduria vienoje vietoje.',
  },
  {
    title: 'Klausimai, kuriuos užduoda pirkėjai',
    text: 'Užrakto paspaudimai, išvaizda ir veikimas atskirai, aiškus komplektacijos sąrašas – viskas matyti iš karto, be papildomų klausimų.',
  },
  {
    title: 'Tik foto technika',
    text: 'Jokių sofų ir dviračių. Fotoaparatai, objektyvai ir priedai – iš žmonių, kurie jais tikrai fotografavo.',
  },
];

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="font-heading text-xl font-bold">{title}</h3>
      <p className="text-[1.0625rem] leading-relaxed text-foreground/75">{text}</p>
    </div>
  );
}

function SectionHeading({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="flex flex-col gap-3.5">
      <h2 className="font-heading text-3xl leading-tight font-extrabold sm:text-4xl">{title}</h2>
      <p className="text-lg leading-relaxed text-foreground/75">{lead}</p>
    </div>
  );
}

const eyebrowClass = 'text-[0.8125rem] font-semibold tracking-[0.08em] text-primary-ink uppercase';

export function About() {
  return (
    <div lang="lt" className="flex flex-col gap-16 pt-6 sm:gap-22 sm:pt-10">
      <section className="flex flex-wrap items-center gap-x-18 gap-y-12">
        <div className="flex min-w-0 flex-[1_1_32rem] flex-col gap-6">
          <p className={eyebrowClass}>Apie mus</p>
          <h1 className="font-heading text-[2.5rem] leading-[1.02] font-extrabold tracking-tight text-balance sm:text-[4rem]">
            Naudota foto technika be spėlionių.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-foreground/75 sm:text-xl">
            exposé – tai vieta Lietuvoje pirkti ir parduoti naudotus fotoaparatus, objektyvus ir
            priedus. Sukūrėme ją, nes ieškoti tinkamo fotoaparato tarp tūkstančių skelbimų apie
            viską iš eilės buvo per sunku.
          </p>
        </div>
        <div className="mx-auto aspect-square w-full max-w-sm flex-[0_1_24rem] rounded-full bg-primary-soft p-2.5">
          <Image
            src="/images/about/founders.webp"
            alt="Nuotrauka veidrodyje su fotoaparatu"
            width={960}
            height={960}
            sizes="(min-width: 640px) 384px, 90vw"
            className="size-full rounded-full object-cover object-[50%_40%]"
            priority
          />
        </div>
      </section>

      <section className="flex flex-col gap-9">
        <SectionHeading
          title="Kodėl atsiradome"
          lead="Lietuvoje naudotą techniką žmonės parduoda bendruose skelbimų portaluose – ten, kur šalia fotoaparato stovi dviratis ir sofa. Tokiose vietose kartojasi tos pačios dvi problemos."
        />
        <div className="flex flex-col gap-7 border-t pt-8">
          {problems.map((problem) => (
            <TextBlock key={problem.title} {...problem} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-9">
        <SectionHeading
          title="Ką darome kitaip"
          lead="Skelbimas čia kuriamas ne iš laisvo teksto, o iš aiškios struktūros. Todėl kiekvienas skelbimas atsako į tuos pačius klausimus."
        />
        <div className="flex flex-col gap-7">
          {differences.map((difference) => (
            <TextBlock key={difference.title} {...difference} />
          ))}
        </div>
      </section>

      <section className="flex flex-wrap gap-x-14 gap-y-8 rounded-[2rem] border p-6 sm:p-12">
        <div className="flex min-w-0 flex-[1_1_20rem] flex-col gap-3">
          <p className={eyebrowClass}>Kur esame dabar</p>
          <h2 className="font-heading text-[1.75rem] leading-tight font-extrabold sm:text-[2rem]">
            Mažas projektas, didelis noras
          </h2>
        </div>
        <div className="flex min-w-0 flex-[1.4_1_24rem] flex-col gap-4 text-[1.0625rem] leading-relaxed text-foreground/75">
          <p>
            exposé kol kas – ankstyvas bandomasis projektas. Už jo nestovi didelė įmonė: jį kuria
            fotografiją mėgstantis žmogus Vilniuje, laisvalaikiu.
          </p>
          <p>
            Katalogą pildome palaipsniui. Neradote savo modelio? Pridėkite jį pavadinimu –
            peržiūrėsime ir įtrauksime. Vėliau norime čia sukurti ir bendruomenę: forumus,
            pokalbius, pasidalinimą nuotraukomis.
          </p>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-6 rounded-[2rem] bg-foreground p-6 text-background sm:p-12">
        <div className="flex max-w-xl flex-col gap-2">
          <h2 className="font-heading text-[1.75rem] leading-tight font-extrabold sm:text-[2.125rem]">
            Turite technikos, kuri dulka spintoje?
          </h2>
          <p className="text-[1.0625rem] text-background/70">
            Skelbimas sukuriamas per kelias minutes – be pavadinimo sugalvojimo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/sell"
            className="inline-flex h-12 items-center rounded-full bg-background px-6 font-medium text-foreground transition-colors hover:bg-background/85"
          >
            Parduoti techniką
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-full border border-background/30 px-6 font-medium text-background transition-colors hover:bg-background/10"
          >
            Naršyti skelbimus
          </Link>
        </div>
      </section>
    </div>
  );
}
