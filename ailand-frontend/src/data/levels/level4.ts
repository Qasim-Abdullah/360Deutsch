const level4 = {
  levelId: "level4",

  tasks: [
    {
      taskId: "task1",

      sentences: [
        {
          id: "s1",
          de: "Ich lerne Deutsch mit Freude",
          en: "I learn German with joy",
        },
        {
          id: "s2",
          de: "Ich gehe heute in die Schule",
          en: "I go to school today",
        },
        {
          id: "s3",
          de: "Wir trinken Wasser im Park",
          en: "We drink water in the park",
        },
        {
          id: "s4",
          de: "Er liest ein Buch zu Hause",
          en: "He reads a book at home",
        },
        {
          id: "s5",
          de: "Sie hört Musik am Abend",
          en: "She listens to music in the evening",
        },
        {
          id: "s6",
          de: "Wir machen Hausaufgaben zusammen",
          en: "We do homework together",
        },
      ],
    },
  ],

  progress: {
    completedTasks: [],
    currentTask: "task1",
    lives: 3,
    maxLives: 3,
  },

  perSentenceStats: {},
};

export default level4;
