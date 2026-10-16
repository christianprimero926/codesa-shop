import { definePreset } from '@primeng/themes';
import base from '@primeng/themes/aura/base';
import badge from '@primeng/themes/aura/badge';
import breadcrumb from '@primeng/themes/aura/breadcrumb';
import button from '@primeng/themes/aura/button';
import confirmdialog from '@primeng/themes/aura/confirmdialog';
import dialog from '@primeng/themes/aura/dialog';
import drawer from '@primeng/themes/aura/drawer';
import iconfield from '@primeng/themes/aura/iconfield';
import inputnumber from '@primeng/themes/aura/inputnumber';
import inputtext from '@primeng/themes/aura/inputtext';
import message from '@primeng/themes/aura/message';
import overlaybadge from '@primeng/themes/aura/overlaybadge';
import paginator from '@primeng/themes/aura/paginator';
import popover from '@primeng/themes/aura/popover';
import progressbar from '@primeng/themes/aura/progressbar';
import radiobutton from '@primeng/themes/aura/radiobutton';
import rating from '@primeng/themes/aura/rating';
import select from '@primeng/themes/aura/select';
import skeleton from '@primeng/themes/aura/skeleton';
import stepper from '@primeng/themes/aura/stepper';
import tag from '@primeng/themes/aura/tag';
import toast from '@primeng/themes/aura/toast';

/**
 * Aura con solo los componentes que usa la tienda: el preset completo trae los
 * tokens de más de 80 componentes y pesa unos 100 kB en el bundle inicial.
 */
const AuraForShop = {
  ...base,
  components: {
    badge,
    breadcrumb,
    button,
    confirmdialog,
    dialog,
    drawer,
    iconfield,
    inputnumber,
    inputtext,
    message,
    overlaybadge,
    paginator,
    popover,
    progressbar,
    radiobutton,
    rating,
    select,
    skeleton,
    stepper,
    tag,
    toast,
  },
};

export const CodesaPreset = definePreset<Record<string, unknown>>(AuraForShop, {
  primitive: {
    borderRadius: {
      sm: '6px',
      md: '10px',
      lg: '14px',
      xl: '18px',
    },
  },
  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.600}',
      600: '{indigo.700}',
      700: '{indigo.800}',
      800: '{indigo.900}',
      900: '{indigo.950}',
      950: '{indigo.950}',
    },
    focusRing: {
      width: '3px',
      style: 'solid',
      color: '{primary.300}',
      offset: '2px',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}',
        },
      },
    },
  },
});
