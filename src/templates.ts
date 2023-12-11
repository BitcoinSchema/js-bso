import { B_PREFIX, MAP_PREFIX } from "../constants";

export type Template = {
  name: string;
  description: string;
  data: string[];
};

export const templates = [
  {
    name: "post",
    description: "Create a new post",
    data: [
      B_PREFIX,
      "my post content here",
      "text/markdown",
      "utf-8",
      "|",
      MAP_PREFIX,
      "SET",
      "app",
      "bso",
      "type",
      "post",
    ],
  },
  {
    name: "message",
    description: "used for real-time messaging",
    data: [
      B_PREFIX,
      "my message content here",
      "text/markdown",
      "utf-8",
      "|",
      MAP_PREFIX,
      "SET",
      "app",
      "bso",
      "type",
      "message",
      "paymail",
      "bsotest@nowhere.com",
    ],
  },
  {
    name: "video",
    description: "used for collaborative video curation",
    data: [
      MAP_PREFIX,
      "SET",
      "app",
      "bso",
      "type",
      "video",
      "paymail",
      "bsotest@nowhere.com",
    ],
  },
  {
    name: "func",
    description: "define a function",
    data: [
      MAP_PREFIX,
      "SET",
      "app",
      "bso",
      "type",
      "func-def",
      "function",
      JSON.stringify({
        name: "ask",
        description: "Ask vivi a question.",
        parameters: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "The question to ask Vivi.",
            },
          },
          required: ["prompt"],
        },
      }),
      "price",
      "1000",
    ],
  },
  {
    name: "call-func",
    description: "call a function",
    data: [
      MAP_PREFIX,
      "SET",
      "app",
      "htmx-pay",
      "type",
      "func-call",
      "name",
      "myFunction",
      "bapID",
      "botBapIDHere",
    ],
  },
];
