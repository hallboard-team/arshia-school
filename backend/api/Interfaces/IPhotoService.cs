namespace api.Interfaces;

public interface IPhotoService
{
    // public Task<string[]?> AddPhotoToDisk(IFormFile file, ObjectId targetProductName);
    public Task<string[]?> AddPhotoToDiskAsync(IFormFile file, ObjectId productId);
    public Task<bool> DeletePhotoFromDisk(Photo photo);
}