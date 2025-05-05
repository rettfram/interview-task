# Zadanie Rekrutacyjne

## Cel

Rozbudowa istniejącego projektu poprzez implementację formularza do dodawania wiadomości do bazy danych. Dodatkowo, wiadomości powinny być wyświetlane w tabeli z następującymi kolumnami: ID, Wiadomość, Akcje.

## Wymagania

- Node.js v18.17.0+
- Docker v20.10.11+

### Formularz dodawania wiadomości

- Umożliwia wprowadzenie treści wiadomości oraz dodanie jej do bazy danych.

### Tabela wiadomości

- Wyświetla listę wiadomości z kolumnami: ID, Wiadomość, Akcje.
- W każdym wierszu w kolumnie "Akcje" powinny znajdować się dwie funkcjonalności:
  - **Edycja**: Po naciśnięciu przycisku "Edytuj", powinien pojawić się popup z formularzem umożliwiającym edycję wybranej wiadomości.
  - **Usuwanie**: Po naciśnięciu przycisku "Usuń", wiadomość powinna zostać usunięta z bazy danych.

### Backend

- Należy samodzielnie zaimplementować backend, który obsłuży dodawanie, edytowanie i usuwanie wiadomości z bazy danych.

### Użycie RTK Query

- Do komunikacji z serwerem należy wykorzystać RTK Query.

### Komponenty ShadCN

- W projekcie należy zastosować gotowe komponenty z biblioteki ShadCN, co umożliwi szybkie i estetyczne tworzenie interfejsu użytkownika.

### Uruchomienie projektu

Aby uruchomić projekt, należy w terminalu w głównym katalogu projektu wpisać:

```
docker compose up
```

## Dystrybucja

Wynik powinien być wykonany na osobnym branchu np. "dev" w prywatnym repozytorium i przesłany jako pull request z "dev" na "main". Jako reviewer należy ustawić użytkownika @BiznesportTech.
Żeby BiznesPortTech mógł zobaczyć Twoje repozytorium, musisz dodać go jako współpracownika. 
Możesz to zrobić w zakładce "Settings" -> "Collaborators" -> "Manage access" -> "Invite a collaborator".

## Dodatkowe wskazówki

- Zadbaj o walidację danych w formularzu.
- Upewnij się, że interfejs użytkownika jest intuicyjny i przyjazny.
- Zastosuj najlepsze praktyki programistyczne w kodzie frontendowym i backendowym.
- Upewnij się, że po uruchomieniu projektu za pomocą polecenia `docker compose up` aplikacja uruchamia się poprawnie i działa zgodnie z oczekiwaniami. To właśnie wynik działania tego polecenia będzie weryfikowany w pierwszej kolejności.
