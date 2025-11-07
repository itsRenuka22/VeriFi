package com.fraud.engine.db.converter;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class StringListJsonConverterTest {

    private final StringListJsonConverter converter = new StringListJsonConverter();

    @Test
    void convertsRoundTrip() {
        List<String> reasons = List.of("burst", "geo");
        String json = converter.convertToDatabaseColumn(reasons);
        assertThat(json).contains("burst");

        List<String> restored = converter.convertToEntityAttribute(json);
        assertThat(restored).containsExactlyElementsOf(reasons);
    }

    @Test
    void handlesNullValues() {
        assertThat(converter.convertToDatabaseColumn(null)).isEqualTo("[]");
        assertThat(converter.convertToEntityAttribute(null)).isEmpty();
    }
}
