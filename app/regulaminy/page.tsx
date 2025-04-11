"use client"

import { Link } from "@heroui/link";
import { Divider, Tab, Tabs } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const Regulations = () => {
    return (
        <Suspense>
            <TabsContent/>
        </Suspense>
    );
}
 
export default Regulations;

const TabsContent = () => {
    const params = useSearchParams()
    const router = useRouter()

    return (
        <main className="max-w-3xl mx-auto p-4">
            <Tabs
                variant="underlined"
                fullWidth
                color="primary"
                defaultSelectedKey={
                    params.has("meski-krag")
                    ? "meski-krag"
                    : params.has("glowny")
                    ? "glowny"
                    : params.has("polityka-prywatnosci")
                    ? "polityka-prywatnosci" 
                    : ""
                }
                onSelectionChange={(key)=>{router.replace(`/regulaminy?${key}`)}}
            >
                <Tab key="" title="Wszystko">
                    <div className="space-y-4">
                        <Circle/>
                        <Divider/>
                        <Regulation/>
                        <Divider/>
                        <PrivacyPolicy/>
                    </div>
                </Tab>
                <Tab key="meski-krag" title="Męski krąg">
                    <Circle/>
                </Tab>
                <Tab key="glowny" title="Regulamin">
                    <Regulation/>
                </Tab>
                <Tab key="polityka-prywatnosci" title="Polityka Prywatności">
                    <PrivacyPolicy/>
                </Tab>
            </Tabs>
        </main>
    );
}

const Circle = () => {
    return (
        <main className="space-y-4 px-4">
            <h5 className="text-center">
                Zasady uczestnictwa w kręgu
            </h5>
            <p className="text-center">Przychodząc na spotkania męskiego kręgu, akceptujesz zasady zawarte poniżej.</p>
            <ol className="list-decimal list-outside space-y-4 text-lg">
                <li><span className="font-bold">Poufność i anonimizacja – </span>To, co jest mówione w kręgu, zostaje w kręgu. Jeśli chcesz podzielić się czyjąś historią na zewnątrz, robisz to w sposób uniemożliwiający identyfikację osoby, której dotyczyła – nie używamy imion, nazwisk, zawodów ani żadnych informacji wskazujących, że dana osoba była uczestnikiem kręgu. Możesz powiedzieć np. “znam kogoś, kto miał podobne doświadczenie”.</li>
                <li><span className="font-bold">Płatność – </span>Po pierwszym spotkaniu podejmujesz decyzję, czy zostajesz w kręgu. Jeśli tak, spotkania są płatne z góry za trzy spotkania. Rozliczenia odbywają się poprzez moderatora kręgu.</li>
                <li><span className="font-bold">Brak nagrań, zdjęć i telefonów – </span>Nie nagrywamy, nie transmitujemy, nie robimy zdjęć ani selfie. Jeśli musisz być pod telefonem (np. ze względu na rodzinę), informujesz o tym przed spotkaniem. W innym wypadku telefony pozostają wyłączone. Tworzymy przestrzeń autentyczności i zaufania.</li>
                <li><span className="font-bold">Słuchamy, nie oceniamy, mówimy od siebie – </span>Słuchamy z uważnością, nie przerywamy, nie oceniamy. Dzielimy się własnym doświadczeniem, mówiąc w pierwszej osobie. Każdy ma też prawo milczeć – można być uczestnikiem spotkania, nie wypowiadając się ani razu.</li>
                <li><span className="font-bold">Brak przemocy – </span>Nie stosujemy przemocy w żadnej formie – werbalnej, emocjonalnej ani fizycznej. Tworzymy przestrzeń bezpieczeństwa, zaufania i wzajemnego szacunku.</li>
                <li><span className="font-bold">Stan obecności – </span>Przychodzimy trzeźwi i w pełni świadomi. Substancje zmieniające świadomość (w tym marihuana) nie są akceptowane przed ani w trakcie spotkania. Wyjątkiem są leki przepisane przez lekarza.</li>
                <li><span className="font-bold">Wsparcie zamiast narzucania rad – </span>Możemy dzielić się swoimi doświadczeniami, ale nie narzucamy innym rad. Jeśli ktoś chce usłyszeć radę, wyraźnie o nią prosi.</li>
                <li><span className="font-bold">Unikamy trzech tematów – </span>Religia, polityka i wojna płci to tematy, których nie poruszamy, chyba że w ramach ciekawości lub potrzeby wentylacji emocji przez uczestnika.</li>
                <li><span className="font-bold">Tematy spotkań – </span>Tematy przyniesione przez uczestników mają pierwszeństwo przed zaplanowanymi. Spotkanie kończymy refleksją, wdzięcznością lub krótkim podsumowaniem.</li>
                <li><span className="font-bold">Indywidualna odpowiedzialność – </span>Każdy uczestnik bierze odpowiedzialność za to, co wynosi z kręgu, jak również za to, co wnosi.</li>
                <li><span className="font-bold">Dobrowolność i intencja – </span>Udział w kręgu jest dobrowolny. Przychodzimy z intencją szczerości, rozwoju i wsparcia siebie nawzajem. Obecność i uważność są równie ważne, jak dzielenie się słowem. Jeśli zdecydujesz się zakończyć udział w kręgu – poinformuj o tym. Informacje organizacyjne są przekazywane przez komunikator grupowy – najczęściej WhatsApp.</li>
            </ol>
        </main>
    )
}

const Regulation = () => {
    return (
        <main className="space-y-4 px-4">
            <h5 className="text-center">
                Regulamin korzystania ze strony Męska Strona Mocy
            </h5>
            <ol className="list-decimal list-outside space-y-4 text-lg">
                <li><span className="font-bold">Postanowienia ogólne</span>
                    <ul className="list-outside space-y-2">
                        <li>Niniejszy regulamin określa zasady korzystania ze strony internetowej Męska Strona Mocy dostępnej pod adresem <Link size="lg" href="/">www.meska-strona-mocy.pl</Link></li>
                        <li>Właścicielem i administratorem strony jest Alexander Krysiuk, działający jako osoba prywatna.</li>
                        <li>Regulamin obowiązuje wszystkich użytkowników korzystających ze strony, zarówno niezarejestrowanych, jak i posiadających konto.</li>
                        <li>Korzystanie ze strony oznacza akceptację niniejszego regulaminu.</li>
                    </ul>
                </li>
                <li><span className="font-bold">Rejestracja i konto użytkownika</span>
                    <ul className="list-outside space-y-2">
                        <li>Rejestracja na stronie jest dobrowolna i bezpłatna.</li>
                        <li>W celu założenia konta użytkownik podaje: adres e-mail</li>
                        <li>Użytkownik zobowiązuje się do podania prawdziwych danych i nieudostępniania swojego konta osobom trzecim.</li>
                        <li>Administrator zastrzega sobie prawo do usunięcia konta w przypadku naruszenia regulaminu.</li>
                    </ul>
                </li>
                <li><span className="font-bold">Zasady korzystania ze strony</span>
                    <ul className="list-outside space-y-2">
                        <li>Użytkownik zobowiązuje się do korzystania ze strony w sposób zgodny z prawem i dobrymi obyczajami.</li>
                        <li>Zabronione jest dostarczanie treści o charakterze bezprawnym, obraźliwym lub wulgarnym.</li>
                    </ul>
                </li>
                <li><span className="font-bold">Odpowiedzialność</span>
                    <ul className="list-outside space-y-2">
                        <li>Administrator nie ponosi odpowiedzialności za treści publikowane przez użytkowników.</li>
                        <li>Administrator zastrzega sobie prawo do czasowego lub stałego zablokowania dostępu do strony w przypadku naruszeń.</li>
                    </ul>
                </li>
                <li><span className="font-bold">Postanowienia końcowe</span>
                    <ul className="list-outside space-y-2">
                        <li>Administrator zastrzega sobie prawo do wprowadzania zmian w regulaminie.</li>
                        <li>Zmiany wchodzą w życie z chwilą opublikowania na stronie.</li>
                    </ul>
                </li>
            </ol>
        </main>
    )
}

const PrivacyPolicy = () => {
    return (
        <main className="space-y-4 px-4">
            <h5 className="text-center">
                Poltyka Prywatności Męskiej Strony Mocy
            </h5>
            <ol className="list-decimal list-outside space-y-4 text-lg">
                <li><span className="font-bold">Administrator danych - </span>Administratorem danych osobowych użytkowników strony jest Alexander Krysiuk, osoba prywatna.
                    <ul className="list-outside space-y-2">
                        <li>Kontakt: <Link size="lg" href="mailto:kontakt@meska-strona-mocy.pl">kontakt@meska-strona-mocy.pl</Link></li>
                    </ul>
                </li>
                <li><span className="font-bold">Zakres przetwarzanych danych - </span>Przetwarzamy dane, które użytkownik sam podaje podczas:
                    <ul className="list-outside space-y-2">
                        <li>Rejestracji na stronie (np. imię, adres e-mail)</li>
                        <li>Zakupu usług lub produktów (dane do realizacji płatności)</li>
                    </ul>
                </li>
                <li><span className="font-bold">Cele przetwarzania danych - </span>Dane przetwarzamy w celu:
                    <ul className="list-outside space-y-2">
                        <li>Obsługi konta użytkownika</li>
                        <li>Realizacji zamówienia i płatności</li>
                        <li>Kontaktowania się z użytkownikiem w sprawach związanych z obsługą serwisu</li>
                    </ul>
                </li>
                <li><span className="font-bold">Podstawa prawna - </span>Dane przetwarzamy na podstawie:
                    <ul className="list-outside space-y-2">
                        <li>Zgody użytkownika (art. 6 ust. 1 lit. a RODO)</li>
                        <li>Wykonania umowy (art. 6 ust. 1 lit. b RODO)</li>
                        <li>Obowiązków prawnych (art. 6 ust. 1 lit. c RODO)</li>
                    </ul>
                </li>
                <li><span className="font-bold">Podmioty, którym powierzamy dane - </span>W celu realizacji płatności online, dane użytkownika mogą być przekazywane do Stripe (Stripe Payments Europe Ltd.).</li>
                <li><span className="font-bold">Okres przechowywania danych - </span>Dane przechowujemy tak długo, jak jest to niezbędne do:
                    <ul className="list-outside space-y-2">
                        <li>Realizacji usług</li>
                        <li>Wypełnienia obowiązków prawnych</li>
                        <li>Do momentu wycofania zgody przez użytkownika</li>
                    </ul>
                </li>
                <li><span className="font-bold">Prawa użytkownika - </span>Użytkownik ma prawo do:
                    <ul className="list-outside space-y-2">
                        <li>Dostępu do swoich danych</li>
                        <li>Sprostowania danych</li>
                        <li>Usunięcia danych</li>
                        <li>Ograniczenia przetwarzania danych</li>
                        <li>Wniesienia sprzeciwu wobec przetwarzania danych</li>
                        <li>Przeniesienia danych</li>
                        <li>Złożenia skargi do Prezesa UODO (organ nadzorczy)</li>
                    </ul>
                </li>
                <li><span className="font-bold">Dobrowolność podania danych - </span>Podanie danych jest dobrowolne, ale niezbędne do rejestracji i/lub dokonania zakupu.</li>
            </ol>
        </main>
    )
}