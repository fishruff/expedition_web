package ru.fishruff.expedition.outbox;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/** Отправка в api по HTTP. Единственный класс, который знает про сеть. */
public final class HttpEventSender implements EventSender {

    private final HttpClient client;
    private final URI url;
    private final String key;
    private final Duration timeout;

    public HttpEventSender(URI url, String key, Duration timeout) {
        this.url = url;
        this.key = key;
        this.timeout = timeout;
        this.client = HttpClient.newBuilder().connectTimeout(timeout).build();
    }

    @Override
    public int send(String jsonBatch) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(url)
                .timeout(timeout)
                .header("Content-Type", "application/json")
                // Ключ обязан быть из латиницы: заголовки HTTP не переносят не-ASCII.
                // Проверка стоит в Settings, здесь на неё только опираемся.
                .header("X-Expedition-Key", key)
                .POST(HttpRequest.BodyPublishers.ofString(jsonBatch, StandardCharsets.UTF_8))
                .build();

        return client.send(request, HttpResponse.BodyHandlers.discarding()).statusCode();
    }
}
