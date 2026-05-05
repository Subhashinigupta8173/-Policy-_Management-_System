package com.insurex.policy.service.storage;

import com.insurex.policy.exception.ResourceNotFoundException;
import com.insurex.policy.exception.StorageException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Objects;
import java.util.UUID;

@Service
@Primary
@Slf4j
public class LocalStorageService implements StorageService {

    private final Path rootLocation;

    public LocalStorageService(@Value("${app.storage.location}") String storageLocation) {
        this.rootLocation = Paths.get(storageLocation).toAbsolutePath().normalize();
        try {
            Files.createDirectories(rootLocation);
            log.info("Storage directory: {}", rootLocation);
        } catch (IOException e) {
            throw new StorageException("Cannot create storage directory: " + rootLocation, e);
        }
    }

    @Override
    public String store(MultipartFile file, String prefix) {
        String originalName = StringUtils.cleanPath(
                Objects.requireNonNull(file.getOriginalFilename(), "Filename must not be null"));
        String uniqueName = UUID.randomUUID() + "_" + originalName;
        String relative = prefix + uniqueName;
        Path targetPath = rootLocation.resolve(relative).normalize();

        if (!targetPath.startsWith(rootLocation)) {
            throw new StorageException("Path traversal detected: " + originalName);
        }

        try {
            Files.createDirectories(targetPath.getParent());
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.debug("Stored file: {}", relative);
            return relative;
        } catch (IOException e) {
            throw new StorageException("Failed to store file " + originalName, e);
        }
    }

    @Override
    public Resource loadAsResource(String relativePath) {
        try {
            Path file = rootLocation.resolve(relativePath).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("File not found: " + relativePath);
            }
            return resource;
        } catch (java.net.MalformedURLException e) {
            throw new StorageException("Could not read file: " + relativePath, e);
        }
    }

    @Override
    public void delete(String relativePath) {
        try {
            Files.deleteIfExists(rootLocation.resolve(relativePath));
        } catch (IOException e) {
            log.warn("Could not delete file: {}", relativePath);
        }
    }
}
