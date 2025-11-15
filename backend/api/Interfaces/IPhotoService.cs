namespace api.Interfaces;

public interface IPhotoService
{
  public Task<string[]?> AddMemberPhotoToDiskAsync(IFormFile file, MemberPhoto? photo, ObjectId userId);
  public Task<string[]?> AddPhotoToDiskAsync(IFormFile file, ObjectId userId);

  public Task<bool> DeletePhotoFromDisk(Photo photo);
  public Task<bool> DeleteMemberPhotoFromDiskAsync(MemberPhoto photo);
}
