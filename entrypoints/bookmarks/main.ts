import { createApp } from "vue";

import "css-reset-and-normalize/css/reset-and-normalize.min.css";
import "css-reset-and-normalize/css/button-reset.min.css";
import "css-reset-and-normalize/css/link-reset.min.css";
import "animate.css";
import "./css/style.css";
import "./css/theme.css";
import "./css/utils.css";

import App from "./App.vue";
import router from "@/entrypoints/bookmarks/router";
import { PiniaColada } from "@pinia/colada";
import pinia from "./store";

const app = createApp(App);

app.use(pinia);
app.use(PiniaColada);
app.use(router);

app.mount("#app");
