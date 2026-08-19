plugins {
    java
}

group = "ru.fishruff.expedition"
version = "0.1.0"

repositories {
    mavenCentral()

    maven {
        name = "papermc"
        url = uri("https://repo.papermc.io/repository/maven-public/")
    }
}

dependencies {

    compileOnly("io.papermc.paper:paper-api:1.21-R0.1-SNAPSHOT")

    // Gson и Adventure приходят с сервером, поэтому в тестах их берём из paper-api.
    testCompileOnly("io.papermc.paper:paper-api:1.21-R0.1-SNAPSHOT")
    testRuntimeOnly("io.papermc.paper:paper-api:1.21-R0.1-SNAPSHOT")

    testImplementation(platform("org.junit:junit-bom:5.11.3"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")

}

java {

    toolchain.languageVersion.set(JavaLanguageVersion.of(21))

}

tasks.test {
    useJUnitPlatform()
    testLogging {
        events("failed")
    }
}
