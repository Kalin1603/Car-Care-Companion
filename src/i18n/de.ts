export default {
  "appName": "ServiX",
  "auth": {
    "welcome": "Willkommen bei ServiX",
    "tagline": "Ihr digitaler Partner für die Verwaltung und Wartung Ihres Autos.",
    "loginTitle": "Anmeldung bei Ihrem Konto",
    "registerTitle": "Neues Konto erstellen",
    "loginAction": "Anmelden",
    "registerAction": "Konto erstellen",
    "usernameLabel": "Benutzername*",
    "passwordLabel": "Passwort*",
    "confirmPasswordLabel": "Passwort bestätigen*",
    "fullNameLabel": "Vollständiger Name*",
    "emailLabel": "E-Mail*",
    "phoneLabel": "Telefon (optional)",
    "switchToRegister": "Haben Sie noch kein Konto?",
    "createHere": "Registrieren",
    "switchToLogin": "Haben Sie bereits ein Konto?",
    "loginHere": "Anmelden",
    "or": "ODER",
    "signInWithGoogle": "Mit Google anmelden",
    "googleSignInError": "Anmeldung mit Google fehlgeschlagen. Bitte versuchen Sie es erneut.",
    "googleSignInNotConfigured": "Google-Anmeldung ist nicht konfiguriert.",
    "errorCredentials": "Ungültige Anmeldedaten.",
    "errorUserExists": "Benutzername ist vergeben.",
    "errorEmailExists": "E-Mail ist bereits registriert.",
    "errorFields": "Bitte füllen Sie alle Pflichtfelder aus.",
    "errorPasswordMismatch": "Passwörter stimmen nicht überein.",
    "errorAccountNotConfirmed": "Konto nicht bestätigt. Bitte überprüfen Sie Ihre E-Mails.",
    "confirmEmailTitle": "Bestätigen Sie Ihre E-Mail",
    "confirmEmailMessage": "Wir haben einen Bestätigungslink an",
    "confirmEmailSimulation": "Dies ist eine Demo. Klicken Sie auf die Schaltfläche unten, um die E-Mail-Bestätigung zu simulieren.",
    "simulateConfirmation": "Bestätigung simulieren",
    "backToLogin": "Zurück zur Anmeldung",
    "accountConfirmed": "Konto für {username} wurde bestätigt. Sie können sich jetzt anmelden."
  },
  "sidebar": {
    "dashboard": "Dashboard",
    "carProfile": "Mein Auto",
    "diagnostics": "KI-Diagnose",
    "profileSettings": "Profileinstellungen",
    "expand": "Erweitern",
    "collapse": "Einklappen"
  },
  "header": {
    "addService": "Service hinzufügen"
  },
  "dashboard": {
    "welcome": "Willkommen, {name}!",
    "yourCar": "Ihr Auto",
    "mileage": "Kilometerstand",
    "year": "Baujahr",
    "vin": "FIN",
    "noVin": "Nicht festgelegt",
    "statistics": "Statistiken",
    "totalServices": "Services insgesamt",
    "totalSpent": "Gesamtausgaben"
  },
  "serviceHistory": {
    "title": "Serviceverlauf",
    "date": "Datum:",
    "mileage": "Kilometerstand:",
    "serviceStation": "Werkstatt:",
    "notes": "Notizen:",
    "noServices": "Sie haben noch keine Services hinzugefügt.",
    "notAvailable": "N/A",
    "edit": "Service bearbeiten"
  },
  "carProfile": {
    "title": "Mein Auto",
    "noPhoto": "Klicken, um ein Foto hochzuladen",
    "make": "Marke",
    "model": "Modell",
    "year": "Baujahr",
    "mileage": "Kilometerstand (km)",
    "vin": "FIN",
    "save": "Änderungen speichern",
    "cancel": "Abbrechen",
    "editProfile": "Profil bearbeiten",
    "specifications": "Spezifikationen",
    "engineType": "Motortyp",
    "transmission": "Getriebe",
    "exteriorColor": "Außenfarbe",
    "transmissionOptions": {
      "automatic": "Automatik",
      "manual": "Manuell"
    },
    "maintenanceMonitors": "Live-Wartungsmonitore",
    "tirePressure": "Reifendruck (PSI)",
    "tirePressureLabels": {
      "fl": "VL",
      "fr": "VR",
      "rl": "HL",
      "rr": "HR"
    },
    "oilLife": "Öl-Lebensdauer",
    "fluidStatus": "Flüssigkeitsstatus",
    "brakeFluid": "Bremsflüssigkeit",
    "coolant": "Kühlmittel",
    "fluidOptions": {
      "ok": "OK",
      "low": "Niedrig",
      "check": "Prüfen"
    }
  },
  "diagnostics": {
    "title": "KI-Diagnose",
    "description": "Beschreiben Sie ein Problem mit Ihrem Auto (z. B. „Ich höre ein quietschendes Geräusch beim Linksabbiegen“, „das Auto stottert beim Beschleunigen“) und unser KI-Assistent liefert mögliche Ursachen, Komplexität und geschätzte Reparaturkosten.",
    "problemDescription": "Problembeschreibung",
    "problemPlaceholder": "Beschreiben Sie das Geräusch, das Gefühl, wann es auftritt, im Detail...",
    "analyze": "Problem analysieren",
    "errorNoProblem": "Bitte beschreiben Sie das Problem.",
    "errorNoCar": "Bitte geben Sie zuerst Marke und Modell Ihres Autos im Bereich „Mein Auto“ ein.",
    "errorGeneric": "Beim Kontakt mit dem KI-Assistenten ist ein Fehler aufgetreten.",
    "resultsTitle": "Diagnoseergebnisse",
    "complexity": "Komplexität:",
    "estimatedCost": "Geschätzte Kosten:",
    "recommendation": "Empfehlung:"
  },
  "modals": {
    "close": "Schließen",
    "addServiceTitle": "Neuer Service / Reparatur",
    "editServiceTitle": "Service / Reparatur bearbeiten",
    "delete": "Löschen",
    "deleteConfirmMessage": "Möchten Sie diesen Service wirklich löschen?",
    "serviceType": "Servicetyp",
    "serviceTypePlaceholder": "z.B. Öl- und Filterwechsel",
    "category": "Kategorie",
    "categoryOptions": {
      "general": "Allgemein",
      "engine": "Motor",
      "brakes": "Bremssystem",
      "suspension": "Federung",
      "electrical": "Elektrisches System",
      "tires": "Reifen & Räder",
      "other": "Sonstiges"
    },
    "mileage": "Kilometerstand (km)",
    "cost": "Kosten (€)",
    "serviceStation": "Werkstatt",
    "serviceStationPlaceholder": "Name der Werkstatt (optional)",
    "notes": "Notizen",
    "notesPlaceholder": "z.B. Ölmarke, bestimmte Teile...",
    "getAIAdvice": "KI-Rat & Schätzung erhalten",
    "errorAIGeneric": "Beim Kontakt mit dem KI-Assistenten ist ein Fehler aufgetreten.",
    "errorAINoServiceType": "Bitte geben Sie einen Servicetyp an, um einen Rat zu erhalten.",
    "aiAssistant": "KI-Assistent",
    "aiEstimatedCost": "Geschätzte Kosten:",
    "aiNextService": "Nächster Service:",
    "aiTips": "Zusätzliche Tipps:",
    "cancel": "Abbrechen",
    "save": "Speichern",
    "errorFillFields": "Bitte füllen Sie Servicetyp, Kilometerstand und Kosten aus.",
    "profileSettingsTitle": "Profileinstellungen",
    "personalData": "Persönliche Daten",
    "fullName": "Name",
    "email": "E-Mail",
    "phone": "Telefon",
    "saveData": "Daten speichern",
    "changePassword": "Passwort ändern",
    "oldPassword": "Altes Passwort",
    "newPassword": "Neues Passwort",
    "errorOldPassword": "Falsches altes Passwort!",
    "errorNewPassword": "Das neue Passwort muss mindestens 3 Zeichen lang sein.",
    "changePasswordAction": "Passwort ändern",
    "logout": "Abmelden",
    "language": "Sprache"
  },
  "pro": {
    "title": "Werde PRO",
    "unlockAiTitle": "KI-Diagnose freischalten",
    "unlockAiDiagnosticsDescription": "Erhalten Sie Zugang zu unserer fortschrittlichen KI-gestützten Diagnose, um die Probleme Ihres Autos besser zu verstehen. Beschreiben Sie ein Problem und erhalten Sie in Sekundenschnelle mögliche Ursachen, geschätzte Kosten und die Reparaturkomplexität.",
    "description": "Schalten Sie leistungsstarke KI-Funktionen frei, um das Fahrzeugmanagement auf die nächste Stufe zu heben.",
    "feature1": "Fortschrittliche KI-Problem-Diagnose",
    "feature2": "KI-gestützte Service-Beratung & Kostenschätzungen",
    "feature3": "Bevorzugter Support",
    "price": "19,99",
    "oneTimePayment": "Einmalzahlung",
    "paymentDetails": "Zahlungsdetails",
    "cardholderName": "Name des Karteninhabers",
    "cardNumber": "Kartennummer",
    "expiryDate": "Gültig bis (MM/JJ)",
    "cvc": "CVC",
    "payNow": "Jetzt bezahlen & PRO freischalten",
    "upgradeNow": "Jetzt auf PRO upgraden",
    "upgradeSuccess": "Herzlichen Glückwunsch! Sie sind jetzt ein PRO-Mitglied.",
    "paymentProcessing": "Zahlung wird verarbeitet..."
  },
  "common": {
      "loading": "Wird geladen...",
      "pro": "PRO",
      "aiErrorUnavailable": "Der KI-Dienst ist nicht verfügbar. Bitte überprüfen Sie den API-Schlüssel.",
      "carSavedSuccess": "Fahrzeugdaten erfolgreich gespeichert!",
      "profileUpdatedSuccess": "Profil erfolgreich aktualisiert!",
      "passwordChangedSuccess": "Passwort erfolgreich geändert!",
      "serviceAddedSuccess": "Service erfolgreich hinzugefügt!",
      "serviceUpdatedSuccess": "Service erfolgreich aktualisiert!",
      "serviceDeletedSuccess": "Service gelöscht."
  }
};