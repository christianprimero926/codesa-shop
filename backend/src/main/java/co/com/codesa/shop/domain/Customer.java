package co.com.codesa.shop.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Column(name = "customer_full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "customer_email", nullable = false, length = 120)
    private String email;

    @Column(name = "customer_phone", nullable = false, length = 10)
    private String phone;

    @Column(name = "customer_address", nullable = false, length = 200)
    private String address;

    @Column(name = "customer_city", nullable = false, length = 80)
    private String city;
}
