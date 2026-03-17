import { merge } from "webpack-merge";
import common from "./webpack.common.js";

export default merge(common, {
  mode: "development",

  devtool: "eval-source-map",

  devServer: {
    static: "./dist",
    port: 8080,
    open: true
  },

  output: {
    publicPath: "/"
  }
});