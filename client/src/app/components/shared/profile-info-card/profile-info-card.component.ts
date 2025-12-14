import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UserProfile } from '../../../models/user-profile.model'; // آدرس مدل را چک کن

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

  // لاجیک نمایش عکس
  getProfilePhoto(): string {
    if (this.user?.photoUrl && this.user.photoUrl.trim() !== '') {
      return this.user.photoUrl;
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