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

}

java {

    toolchain.languageVersion.set(JavaLanguageVersion.of(21))

}