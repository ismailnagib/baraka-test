### Running the service with Docker

1. To run the service with Docker after cloning this repository, you have to first build the Docker image with this command:
```
docker build baraka-test --tag baraka-test-image
```
<sup>*You can change `baraka-test-image` with other names if you want.*</sup>

2. Then to run the service, use this command:
```
docker run -p 3000:3000 baraka-test-image
```
<sup>*Change `baraka-test-image` with the name you used in the first step.*</sup>

3. The service will then be available at:
```
http://localhost:3000
```

---

### API Documentation

<details>
  <summary><b>Get Portfolio by Stock Symbol</b></summary>
  <ul>
    <li><b>Method</b>: GET</li>
    <li><b>Endpoint</b>: <code>/portfolio/stocks</code></li>
    <li>
      <b>Query Parameters</b>:
      <ul>
        <li><b>symbol</b> &rarr; stock symbol, e.g. <i>TSLA</i>, <i>AMZN</i></li>
      </ul>
    </li>
    <br>
    Example: <code>/portfolio/stocks?symbol=TSLA</code>
  </ul>
</details>
<details>
  <summary><b>Get Portfolio by Bucket Name</b></summary>
  <ul>
    <li><b>Method</b>: GET</li>
    <li><b>Endpoint</b>: <code>/portfolio/buckets</code></li>
    <li>
      <b>Query Parameters</b>:
      <ul>
        <li><b>name</b> &rarr; bucket name, e.g. <i>bucketA</i>, <i>bucketB</i></li>
      </ul>
    </li>
    <br>
    Example: <code>/portfolio/buckets?name=bucketA</code>
  </ul>
</details>

---

#### Notes

1. The list of valid stock symbols are predetermined, please use one of these symbols below:
- **PBR**
- **AAPL**
- **NVDA**
- **NIO**
- **AMD**
- **F**
- **TSLA**
- **AMZN**
- **AMC**
- **CCL**

<sup>*You can choose to modify this list by going to `/configs/constants.js` and changing the value of `VALID_PRODUCT_SYMBOLS`*.</sup>

2. The list of available buckets and their content are also predetermined, please use one of these buckets below:
- **Bucket A**, containing these stocks:
  - **PBR**
  - **AAPL**
  - **NVDA**
  - **NIO**
  - **AMD**
- **Bucket B**, containing these stocks:
  - **F**
  - **TSLA**
  - **AMZN**
  - **AMC**
  - **CCL**

<sup>*You can choose to modify this list by going to `/configs/buckets.js` and changing the content of the `buckets` array*.</sup>

3. The list of trades happening with the various stocks are also predetermined. It's available at `trades.json` and you can modify the file content to change the calculation result given by the APIs.