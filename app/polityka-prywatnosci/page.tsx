import { Link } from "@heroui/link";

const Regulations = () => {
    return ( 
        <main className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6">
                Polityka Prywatności i Regulamin korzystania z Męska Strona Mocy
            </h1>
        
            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">1. Postanowienia ogólne</h2>
                <ul className="list-disc list-inside">
                    <li>Niniejszy dokument określa zasady korzystania ze strony internetowej Męska Strona Mocy dostępnej pod adresem <Link href="/">www.meska-strona-mocy.pl</Link></li>
                    <li>Właścicielem i administratorem strony jest Alexander Krysiuk, działający jako osoba prywatna.</li>
                    <li>Dokument obowiązuje wszystkich użytkowników korzystających ze strony, zarówno niezarejestrowanych, jak i posiadających konto.</li>
                    <li>Korzystanie ze strony oznacza akceptację niniejszego regulaminu.</li>
                </ul>
            </section>
        
            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">2. Rejestracja i konto użytkownika</h2>
                <ul className="list-disc list-inside">
                    <li>Rejestracja na stronie jest dobrowolna i bezpłatna.</li>
                    <li>W celu założenia konta użytkownik podaje: imię, nazwisko oraz adres e-mail.</li>
                    <li>Użytkownik zobowiązuje się do podawania prawdziwych danych i niezakładania konta w imieniu innych osób.</li>
                    <li>Administrator strony ma prawo do usunięcia konta użytkownika w przypadku naruszenia regulaminu.</li>
                </ul>
            </section>
  
            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">3. Zasady korzystania ze strony</h2>
                <ul className="list-disc list-inside">
                    <li>Użytkownicy mogą korzystać z treści publikowanych na stronie zgodnie z ich przeznaczeniem.</li>
                    <li>Zabrania się podejmowania działań naruszających stabilność działania strony, jej bezpieczeństwo oraz praw osób trzecich.</li>
                    <li>Administrator strony może wprowadzać zmiany w funkcjonalności oraz treściach dostępnych dla użytkowników.</li>
                    <li>Strona może zawierać reklamy i linki do stron trzecich. Administrator nie ponosi odpowiedzialności za treści zewnętrzne.</li>
                </ul>
            </section>
        
            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">4. Ochrona danych osobowych</h2>
                <ul className="list-disc list-inside">
                    <li>Administrator przetwarza dane osobowe użytkowników zgodnie z obowiązującymi przepisami prawa.</li>
                    <li>Dane użytkowników są wykorzystywane wyłącznie do celów związanych z funkcjonowaniem strony.</li>
                    <li>Użytkownik ma prawo do dostępu do swoich danych, ich poprawiania oraz usunięcia.</li>
                    <li>Administrator zobowiązuje się do ochrony danych osobowych i nieudostępniania ich podmiotom trzecim bez zgody użytkownika, chyba że wymagają tego przepisy prawa.</li>
                </ul>
            </section>
        
            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">5. Newsletter</h2>
                <ul className="list-disc list-inside">
                    <li>Użytkownicy mogą zapisać się do newslettera, podając swój adres e-mail.</li>
                    <li>Subskrypcja jest dobrowolna i może być w każdej chwili anulowana poprzez link w wiadomości e-mail.</li>
                    <li>Adresy e-mail podane do subskrypcji newslettera nie będą udostępniane podmiotom trzecim.</li>
                </ul>
            </section>
        
            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">6. Komentarze i treści użytkowników</h2>
                <ul className="list-disc list-inside">
                    <li>Użytkownicy mogą zamieszczać komentarze i treści zgodnie z zasadami kultury i dobrych obyczajów.</li>
                    <li>Administrator ma prawo do moderowania i usuwania treści naruszających regulamin.</li>
                    <li>Zabronione jest publikowanie treści obraźliwych, wulgarnych, reklamowych oraz niezgodnych z prawem.</li>
                </ul>
            </section>
        
            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">7. Odpowiedzialność</h2>
                <ul className="list-disc list-inside">
                    <li>Administrator strony nie ponosi odpowiedzialności za sposób, w jaki użytkownicy korzystają z publikowanych treści.</li>
                    <li>Administrator zastrzega sobie prawo do modyfikacji strony, usuwania treści oraz czasowego zawieszenia działania strony.</li>
                    <li>Administrator nie ponosi odpowiedzialności za przerwy techniczne ani ewentualne straty wynikające z korzystania ze strony.</li>
                </ul>
            </section>
        
            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">8. Zmiany regulaminu</h2>
                <ul className="list-disc list-inside">
                    <li>Administrator ma prawo do zmiany niniejszego dokumentu w dowolnym czasie.</li>
                    <li>Użytkownicy zostaną poinformowani o zmianach poprzez ogłoszenie na stronie lub drogą mailową.</li>
                    <li>Korzystanie ze strony po zmianie regulaminu oznacza jego akceptację.</li>
                </ul>
            </section>
        
            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">9. Postanowienia końcowe</h2>
                <ul className="list-disc list-inside">
                    <li>W sprawach nieuregulowanych niniejszym dokumentem obowiązują przepisy prawa polskiego.</li>
                    <li>Wszelkie spory związane z korzystaniem ze strony będą rozstrzygane przez sąd właściwy dla miejsca zamieszkania administratora.</li>
                    <li>Dokument obowiązuje od dnia 04-03-2025.</li>
                </ul>
            </section>
        </main>
    );
}
 
export default Regulations;