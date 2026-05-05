package com.insurex.policy.service.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    /**
     * Stores the file under ./storage/{prefix}/ and returns the relative path.
     * Swap this implementation for S3 by creating a new @Primary @Service class
     * that implements StorageService using AWS SDK S3Client.
     */
    String store(MultipartFile file, String prefix);

    Resource loadAsResource(String relativePath);

    void delete(String relativePath);
}
