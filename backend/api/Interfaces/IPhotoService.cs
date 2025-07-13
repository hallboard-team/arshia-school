namespace api.Interfaces;

public interface IPhotoService
{
    public Task<string[]?> AddPhotoToDiskAsync(IFormFile file, string productId);
    public Task<bool> DeletePhotoFromDisk(Photo photo);
}