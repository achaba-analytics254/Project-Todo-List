import path from "node:path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: "./src/index.js",

  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "../dist"),
    clean: true
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html"
    })
  ],

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.html$/i,
        use: ["html-loader"]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource"
      }
    ]
  }
};