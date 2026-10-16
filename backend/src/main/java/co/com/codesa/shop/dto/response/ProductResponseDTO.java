package co.com.codesa.shop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDTO {

    private Long id;
    private String name;
    private String brand;
    private String category;
    private Long price;
    private Integer stock;
    private Double rating;
    private String image;
    private String description;
}
