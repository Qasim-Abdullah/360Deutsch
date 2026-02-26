export const mockWords = {
  noun: [
    {
      id: "tisch",
      word: "der Tisch",

      plural: {
        singular: "der Tisch",
        plural: "die Tische"
      },

      example: [
        {
          de: "Der Tisch ist groß.",
          en: "The table is big."
        },
        {
          de: "Der Tisch steht im Wohnzimmer.",
          en: "The table is in the living room."
        },
        {
          de: "Ich stelle das Buch auf den Tisch.",
          en: "I put the book on the table."
        },
        {
          de: "Der Tisch ist aus Holz gemacht.",
          en: "The table is made of wood."
        },
        {
          de: "Wir essen am Tisch.",
          en: "We eat at the table."
        }
      ]

    },
    {
      id: "stuhl",
      word: "der Stuhl",

      ipa: "ʃtuːl",

      plural: {
        singular: "der Stuhl",
        plural: "die Stühle"
      },

      example: [
        {
          de: "Der Stuhl steht neben dem Tisch.",
          en: "The chair stands next to the table."
        },
        {
          de: "Ich setze mich auf den Stuhl.",
          en: "I sit down on the chair."
        },
        {
          de: "Der Stuhl ist sehr bequem.",
          en: "The chair is very comfortable."
        },
        {
          de: "Bitte bring einen Stuhl für den Gast.",
          en: "Please bring a chair for the guest."
        },
        {
          de: "Der alte Stuhl ist kaputt.",
          en: "The old chair is broken."
        }
      ]
    },
    {
      id: "sofa",
      word: "das Sofa",

      plural: {
        singular: "das Sofa",
        plural: "die Sofas"
      },

      example: [
        {
          de: "Das Sofa ist sehr bequem.",
          en: "The sofa is very comfortable."
        }
      ]
    },
    {
      id: "bett",
      word: "das Bett",

      plural: {
        singular: "das Bett",
        plural: "die Betten"
      },

      example: [
        {
          de: "Das Bett ist neu.",
          en: "The bed is new."
        }
      ]
    },
    {
      id: "fenster",
      word: "das Fenster",

      plural: {
        singular: "das Fenster",
        plural: "die Fenster"
      },

      example: [
        {
          de: "Das Fenster ist offen.",
          en: "The window is open."
        }
      ]
    },
    {
      id: "tuer",
      word: "die Tür",

      plural: {
        singular: "die Tür",
        plural: "die Türen"
      },

      example: [
        {
          de: "Die Tür ist geschlossen.",
          en: "The door is closed."
        }
      ]
    },
    {
      id: "lampe",
      word: "die Lampe",

      plural: {
        singular: "die Lampe",
        plural: "die Lampen"
      },

      example: [
        {
          de: "Die Lampe ist hell.",
          en: "The lamp is bright."
        }
      ]
    },
    {
      id: "schrank",
      word: "der Schrank",

      plural: {
        singular: "der Schrank",
        plural: "die Schränke"
      },

      example: [
        {
          de: "Der Schrank ist groß.",
          en: "The wardrobe is big."
        }
      ]
    },
    {
      id: "spiegel",
      word: "der Spiegel",

      plural: {
        singular: "der Spiegel",
        plural: "die Spiegel"
      },

      example: [
        {
          de: "Der Spiegel hängt an der Wand.",
          en: "The mirror hangs on the wall."
        }
      ]
    },
    {
      id: "teppich",
      word: "der Teppich",

      plural: {
        singular: "der Teppich",
        plural: "die Teppiche"
      },

      example: [
        {
          de: "Der Teppich ist sauber.",
          en: "The carpet is clean."
        }
      ]
    },
    {
      id: "uhr",
      word: "die Uhr",

      plural: {
        singular: "die Uhr",
        plural: "die Uhren"
      },

      example: [
        {
          de: "Die Uhr ist neu.",
          en: "The clock is new."
        }
      ]
    }

  ],

  verb: [
    {
      id: "gehen",
      word: "gehen",

      conjugation: {
        infinitive: "gehen",
        forms: {
          ich: "gehe",
          du: "gehst",
          er: "geht",
          wir: "gehen",
          ihr: "geht",
          sie: "gehen"
        }
      },

      perfect: {
        infinitive: "gehen",
        auxiliary: "sein",
        participle: "gegangen",
        forms: {
          ich: "bin gegangen",
          du: "bist gegangen",
          er: "ist gegangen",
          wir: "sind gegangen",
          ihr: "seid gegangen",
          sie: "sind gegangen"
        }
      },

      example: [
        {
          de: "Ich gehe nach Hause.",
          en: "I go home."
        }
      ]
    }
  ],

  adverb: [
    {
      id: "schnell",
      word: "schnell",
      example: [
        {
          de: "Er läuft schnell.",
          en: "He runs quickly."
        }
      ]
    }
  ],

  adjective: [
    {
      id: "gross",
      word: "groß",
      comparative: "größer",
      superlative: "am größten",
      example: [
        { de: "Das Haus ist groß.", en: "The house is big." },
        { de: "Mein Bruder ist größer als ich.", en: "My brother is bigger than me." },
        { de: "Das ist der größte Tisch.", en: "That is the biggest table." }
      ]
    },
    {
      id: "schnell",
      word: "schnell",
      comparative: "schneller",
      superlative: "am schnellsten",
      example: [
        { de: "Er läuft schnell.", en: "He runs quickly." },
        { de: "Sie fährt schneller.", en: "She drives faster." }
      ]
    },
    {
      id: "schon",
      word: "schön",
      comparative: "schöner",
      superlative: "am schönsten",
      example: [
        { de: "Das Wetter ist schön.", en: "The weather is nice." }
      ]
    },
    {
      id: "gut",
      word: "gut",
      comparative: "besser",
      superlative: "am besten",
      example: [
        { de: "Das Essen ist gut.", en: "The food is good." },
        { de: "Er spricht besser Deutsch.", en: "He speaks German better." },
        { de: "Das ist am besten.", en: "That is best." }
      ]
    }
  ],

  number: [
    {
      id: "eins",
      word: "eins",
      value: 1,
      ordinal: "erste",
      example: [
        { de: "Ich habe ein Buch.", en: "I have one book." },
        { de: "Der erste Tag.", en: "The first day." }
      ]
    },
    {
      id: "zwei",
      word: "zwei",
      value: 2,
      ordinal: "zweite",
      example: [
        { de: "Zwei Äpfel, bitte.", en: "Two apples, please." },
        { de: "Am zweiten Dezember.", en: "On the second of December." }
      ]
    },
    {
      id: "drei",
      word: "drei",
      value: 3,
      ordinal: "dritte",
      example: [
        { de: "Drei Tage.", en: "Three days." },
        { de: "Das dritte Mal.", en: "The third time." }
      ]
    },
    {
      id: "vier",
      word: "vier",
      value: 4,
      ordinal: "vierte",
      example: [
        { de: "Vier Wochen.", en: "Four weeks." }
      ]
    },
    {
      id: "fuenf",
      word: "fünf",
      value: 5,
      ordinal: "fünfte",
      example: [
        { de: "Fünf Minuten.", en: "Five minutes." }
      ]
    }
  ],

  pronoun: [
    {
      id: "ich",
      word: "ich",
      nominative: "ich",
      accusative: "mich",
      dative: "mir",
      genitive: "meiner",
      example: [
        { de: "Ich bin hier.", en: "I am here." },
        { de: "Er gibt mir das Buch.", en: "He gives me the book." }
      ]
    },
    {
      id: "du",
      word: "du",
      nominative: "du",
      accusative: "dich",
      dative: "dir",
      genitive: "deiner",
      example: [
        { de: "Du bist nett.", en: "You are nice." },
        { de: "Ich helfe dir.", en: "I help you." }
      ]
    },
    {
      id: "er",
      word: "er",
      nominative: "er",
      accusative: "ihn",
      dative: "ihm",
      genitive: "seiner",
      example: [
        { de: "Er kommt morgen.", en: "He is coming tomorrow." },
        { de: "Ich sehe ihn.", en: "I see him." }
      ]
    },
    {
      id: "sie",
      word: "sie",
      nominative: "sie",
      accusative: "sie",
      dative: "ihr",
      genitive: "ihrer",
      example: [
        { de: "Sie ist meine Freundin.", en: "She is my friend." },
        { de: "Ich gebe ihr das Buch.", en: "I give her the book." }
      ]
    },
    {
      id: "es",
      word: "es",
      nominative: "es",
      accusative: "es",
      dative: "ihm",
      genitive: "seiner",
      example: [
        { de: "Es regnet.", en: "It is raining." },
        { de: "Ich habe es.", en: "I have it." }
      ]
    },
    {
      id: "wir",
      word: "wir",
      nominative: "wir",
      accusative: "uns",
      dative: "uns",
      genitive: "unser",
      example: [
        { de: "Wir gehen nach Hause.", en: "We are going home." },
        { de: "Er hilft uns.", en: "He helps us." }
      ]
    },
    {
      id: "ihr",
      word: "ihr",
      nominative: "ihr",
      accusative: "euch",
      dative: "euch",
      genitive: "eurer",
      example: [
        { de: "Ihr seid willkommen.", en: "You are welcome." },
        { de: "Ich gebe euch die Bücher.", en: "I give you the books." }
      ]
    },
    {
      id: "sie_plural",
      word: "sie",
      nominative: "sie",
      accusative: "sie",
      dative: "ihnen",
      genitive: "ihrer",
      example: [
        { de: "Sie kommen morgen.", en: "They are coming tomorrow." },
        { de: "Ich gebe ihnen die Schlüssel.", en: "I give them the keys." }
      ]
    }
  ],

  preposition: [
    {
      id: "uber",
      word: "über",
      meaning: "over, about",
      example: [
        { de: "Das Bild hängt über dem Tisch.", en: "The picture hangs over the table." },
        { de: "Wir sprechen über das Wetter.", en: "We are talking about the weather." }
      ]
    },
    {
      id: "hinter",
      word: "hinter",
      meaning: "behind",
      example: [
        { de: "Der Ball ist hinter dem Sofa.", en: "The ball is behind the sofa." },
        { de: "Sie steht hinter mir.", en: "She is standing behind me." }
      ]
    },
    {
      id: "zwischen",
      word: "zwischen",
      meaning: "between",
      example: [
        { de: "Die Bank ist zwischen dem Park und dem Markt.", en: "The bank is between the park and the market." },
        { de: "Zwischen uns ist alles gut.", en: "Between us everything is fine." }
      ]
    },
    {
      id: "vor",
      word: "vor",
      meaning: "in front of, before",
      example: [
        { de: "Das Auto steht vor dem Haus.", en: "The car is in front of the house." },
        { de: "Vor dem Essen wasche ich mir die Hände.", en: "Before eating I wash my hands." }
      ]
    },
    {
      id: "neben",
      word: "neben",
      meaning: "next to",
      example: [
        { de: "Der Stuhl steht neben dem Tisch.", en: "The chair is next to the table." },
        { de: "Sie sitzt neben mir.", en: "She is sitting next to me." }
      ]
    },
    {
      id: "unter",
      word: "unter",
      meaning: "under",
      example: [
        { de: "Die Katze schläft unter dem Tisch.", en: "The cat is sleeping under the table." },
        { de: "Unter der Brücke.", en: "Under the bridge." }
      ]
    },
    {
      id: "auf",
      word: "auf",
      meaning: "on, onto",
      example: [
        { de: "Das Buch liegt auf dem Tisch.", en: "The book is on the table." },
        { de: "Ich warte auf den Bus.", en: "I am waiting for the bus." }
      ]
    },
    {
      id: "in",
      word: "in",
      meaning: "in, into",
      example: [
        { de: "Ich bin in der Küche.", en: "I am in the kitchen." },
        { de: "Er geht in die Schule.", en: "He goes to school." }
      ]
    },
    {
      id: "an",
      word: "an",
      meaning: "at, on",
      example: [
        { de: "Das Bild hängt an der Wand.", en: "The picture hangs on the wall." },
        { de: "Wir sind am Strand.", en: "We are at the beach." }
      ]
    }
  ]
};
