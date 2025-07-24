namespace image_processing.Interfaces;

public interface IPhotoModifySaveService
{
    public Task<string> ResizeImageByScale(IFormFile formFile, string productId, int standardSizeIndex);
    public Task<string> ResizeByPixel(IFormFile formFile, string productId, int widthIn, int heightIn);
    public Task<string> ResizeByPixel_Square(IFormFile formFile, string productId, int side);
    public Task<string> Crop(IFormFile formFile, string productId, int widthIn, int heightIn);
    public Task<string> Crop_Square(IFormFile formFile, string productId, int side);
    public Task<string> CropWithOriginalSide_Square(IFormFile formFile, string productId);
    public Task<string> SaveImageAsIs(IFormFile formFile, string productId, int operation);
}