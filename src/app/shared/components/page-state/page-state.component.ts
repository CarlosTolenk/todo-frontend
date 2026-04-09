import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-state',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './page-state.component.html',
  styleUrl: './page-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageStateComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) description = '';
  @Input() icon = 'info';
  @Input() actionLabel?: string;
  @Input() action: (() => void) | null = null;
}
