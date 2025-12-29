import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UserProfile } from '../../../models/user-profile.model'; // آدرس مدل را چک کن
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-profile-info-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './profile-info-card.component.html',
  styleUrls: ['./profile-info-card.component.scss']
})
export class ProfileInfoCardComponent {
  @Input({ required: true }) user: UserProfile | null = null;
  @Output() avatarChange = new EventEmitter<Event>();
  photoUrl = environment.apiPhotoUrl

  // لاجیک نمایش عکس
  getProfilePhoto(): string {
    console.log('ok');
    
    if (this.user?.photo) {
      console.log(this.user.photo.url_165);
      
      let photo = this.photoUrl + this.user.photo.url_165;

      return photo;
    }
    // هندل کردن حروف بزرگ و کوچک
    if (this.user?.gender?.toLowerCase() === 'male') {
      return 'assets/images/menProfilePhoto.png';
    }
    return 'assets/images/womenProfilePhoto.png';
  }

  onFileSelected(event: Event) {
    this.avatarChange.emit(event);
  }
}