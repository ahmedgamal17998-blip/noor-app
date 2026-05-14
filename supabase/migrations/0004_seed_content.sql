-- ════════════════════════════════════════════════════════════════════
-- 0004: Seed 23 starter surahs (Juz Amma + Al-Fatiha) with full journey
-- ────────────────────────────────────────────────────────────────────
-- Idempotent: safe to re-run. Uses ON CONFLICT to avoid duplicates.
-- After running: admin opens /admin/surahs and clicks "import ayahs"
-- (or the auto-seed endpoint /api/admin/seed-ayahs fetches them).
-- ════════════════════════════════════════════════════════════════════

-- ──────── Surahs ────────
insert into surahs (surah_number, name_arabic, name_english, total_ayahs, revelation_type, level_order, is_active, required_plan) values
  (1,   'الفاتحة',  'Al-Fatiha',   7,  'meccan',  1,  true, 'basic'),
  (114, 'الناس',    'An-Nas',      6,  'meccan',  2,  true, 'basic'),
  (113, 'الفلق',    'Al-Falaq',    5,  'meccan',  3,  true, 'basic'),
  (112, 'الإخلاص',  'Al-Ikhlas',   4,  'meccan',  4,  true, 'basic'),
  (111, 'المسد',    'Al-Masad',    5,  'meccan',  5,  true, 'basic'),
  (110, 'النصر',    'An-Nasr',     3,  'medinan', 6,  true, 'basic'),
  (109, 'الكافرون', 'Al-Kafirun',  6,  'meccan',  7,  true, 'basic'),
  (108, 'الكوثر',   'Al-Kawthar',  3,  'meccan',  8,  true, 'basic'),
  (107, 'الماعون',  'Al-Ma''un',   7,  'meccan',  9,  true, 'basic'),
  (106, 'قريش',     'Quraysh',     4,  'meccan', 10,  true, 'basic'),
  (105, 'الفيل',    'Al-Fil',      5,  'meccan', 11,  true, 'basic'),
  (104, 'الهمزة',   'Al-Humazah',  9,  'meccan', 12,  true, 'basic'),
  (103, 'العصر',    'Al-Asr',      3,  'meccan', 13,  true, 'basic'),
  (102, 'التكاثر',  'At-Takathur', 8,  'meccan', 14,  true, 'basic'),
  (101, 'القارعة',  'Al-Qari''ah', 11, 'meccan', 15,  true, 'basic'),
  (100, 'العاديات', 'Al-Adiyat',   11, 'meccan', 16,  true, 'basic'),
  (99,  'الزلزلة',  'Az-Zalzalah', 8,  'medinan',17,  true, 'basic'),
  (98,  'البينة',   'Al-Bayyinah', 8,  'medinan',18,  true, 'basic'),
  (97,  'القدر',    'Al-Qadr',     5,  'meccan', 19,  true, 'basic'),
  (96,  'العلق',    'Al-Alaq',     19, 'meccan', 20,  true, 'basic'),
  (95,  'التين',    'At-Tin',      8,  'meccan', 21,  true, 'basic'),
  (94,  'الشرح',    'Ash-Sharh',   8,  'meccan', 22,  true, 'basic'),
  (93,  'الضحى',    'Ad-Duha',     11, 'meccan', 23,  true, 'basic')
on conflict (surah_number) do update set
  name_arabic = excluded.name_arabic,
  name_english = excluded.name_english,
  total_ayahs = excluded.total_ayahs,
  level_order = excluded.level_order,
  is_active = true;

-- ──────── Stories per surah ────────
insert into surah_stories (surah_id, title, story_text, meaning_simplified, is_active, language)
select s.id,
  case s.surah_number
    when 1   then 'الفاتحة — أم الكتاب'
    when 114 then 'الناس — حماية من الشيطان'
    when 113 then 'الفلق — حماية من الشرور'
    when 112 then 'الإخلاص — توحيد الله'
    when 111 then 'المسد — قصة أبي لهب'
    when 110 then 'النصر — فتح مكة'
    when 109 then 'الكافرون — لكم دينكم ولي ديني'
    when 108 then 'الكوثر — نهر الجنة'
    when 107 then 'الماعون — الإحسان إلى الفقراء'
    when 106 then 'قريش — رحلة الشتاء والصيف'
    when 105 then 'الفيل — قصة أبرهة والفيل'
    when 104 then 'الهمزة — التحذير من الغيبة'
    when 103 then 'العصر — قيمة الوقت'
    when 102 then 'التكاثر — التحذير من جمع الدنيا'
    when 101 then 'القارعة — يوم القيامة'
    when 100 then 'العاديات — قسم بالخيول'
    when 99  then 'الزلزلة — يوم القيامة'
    when 98  then 'البينة — رسالة الحق'
    when 97  then 'القدر — ليلة القدر'
    when 96  then 'العلق — أول ما نزل من القرآن'
    when 95  then 'التين — أحسن خلق الله'
    when 94  then 'الشرح — مع العسر يسرا'
    when 93  then 'الضحى — لم يتركك ربك'
  end,
  case s.surah_number
    when 1   then 'سورة الفاتحة هي أم الكتاب، وهي أعظم سورة في القرآن. نقرأها في كل ركعة في الصلاة. تبدأ بحمد الله، ثم نطلب منه أن يهدينا الصراط المستقيم، وأن يجعلنا من المنعم عليهم لا من الضالين.'
    when 114 then 'سورة الناس آخر سورة في القرآن. علّمنا الله فيها أن نلتجئ إليه من شر الوسواس الخناس (الشيطان) الذي يوسوس في قلوب الناس. كلما قرأناها قبل النوم، حفظنا الله.'
    when 113 then 'سورة الفلق فيها استعاذة بالله من شر كل المخلوقات: من ظلمة الليل، ومن السحرة، ومن الحاسدين. النبي ﷺ كان يقرأها هو والمعوذات قبل النوم.'
    when 112 then 'سورة الإخلاص تساوي ثلث القرآن! فيها تعليم بسيط لأطفالنا: الله واحد، ما له شريك ولا صاحبة ولا ولد. هو الذي يلجأ إليه كل المخلوقات.'
    when 111 then 'سورة المسد قصة عم النبي ﷺ أبو لهب الذي حارب الإسلام. الله توعّده بالنار، وزوجته كانت تساعده في إيذاء النبي. الدرس: لا يحمي أحد من غضب الله.'
    when 110 then 'سورة النصر نزلت بعد فتح مكة، وكانت إشارة لقرب وفاة النبي ﷺ. علمنا الله إذا انتصرنا، نسبح الله ونستغفره — لا نتكبر.'
    when 109 then 'سورة الكافرون فيها تعليم لقريش: لن نعبد آلهتكم، ولن تعبدوا الله. لكم دينكم ولنا ديننا. لكن نعاملكم بالأخلاق الحسنة.'
    when 108 then 'الكوثر نهر عظيم في الجنة أعطاه الله لنبيه ﷺ. الدرس: مهما حدث، رحمة الله أكبر، ومن آذى النبي فسينقطع ذكره ويبقى ذكر النبي للأبد.'
    when 107 then 'سورة الماعون تذم من يكذّب بيوم القيامة، يدفع اليتيم، ويبخل بالطعام، ويصلّي رياءً. الدرس: الإيمان الحقيقي يظهر في معاملتنا مع الناس.'
    when 106 then 'قريش هم قوم النبي ﷺ، كانوا تجاراً يسافرون شتاءً لليمن وصيفاً للشام. الله أمنهم وأطعمهم — فعليهم أن يعبدوه وحده.'
    when 105 then 'قصة أبرهة الذي جاء من اليمن بفيل عظيم ليهدم الكعبة قبل ميلاد النبي ﷺ. الله أرسل عليه طيوراً صغيرة بحجارة من سجيل، فأهلكتهم كلهم. الكعبة بيت الله المحفوظ.'
    when 104 then 'الويل لمن يهمز الناس (يطعن فيهم بإشارة) ويلمزهم (يعيبهم بكلامه). الذي يجمع المال ويحسبه ويظن أنه سيخلده — سيلقى في نار جهنم.'
    when 103 then 'الزمن يجري بسرعة، وكل إنسان في خسارة إلا أربعة: من آمن، وعمل صالحاً، ودعا للحق، وصبر. درس قصير لكنه ميزان حياتنا.'
    when 102 then 'الناس يلهيهم جمع المال والأولاد والمناصب حتى يموتوا. لو رأوا الجحيم بعين اليقين، لتركوا كل ذلك. الدنيا قصيرة، الآخرة هي الحياة الحقيقية.'
    when 101 then 'القارعة من أسماء يوم القيامة. الناس فيه كالفراش المنتشر، والجبال كالصوف. من ثقلت حسناته فهو في الجنة، ومن خفّت فأمه هاوية (جهنم).'
    when 100 then 'الله يقسم بالخيول التي تجري في الحرب. الإنسان جحود (يكفر بنعمة ربه)، يحب المال جداً. يوم القيامة يخرج كل ما في القبور والصدور.'
    when 99  then 'يوم القيامة تتزلزل الأرض زلزلة شديدة، وتخرج أثقالها (الموتى). من عمل ذرة من خير سيراه، ومن عمل ذرة من شر سيراه. كل صغيرة وكبيرة محسوبة.'
    when 98  then 'الكفار من أهل الكتاب والمشركين كانوا منقسمين، فجاء رسول من الله ببينة (دليل واضح). من آمن وعمل صالحاً فهو خير البرية، ومن كفر فهو شر البرية.'
    when 97  then 'ليلة القدر خير من ألف شهر! فيها أنزل القرآن. تنزّل الملائكة والروح فيها بإذن ربهم من كل أمر. سلامٌ هي حتى مطلع الفجر. نبحث عنها في رمضان.'
    when 96  then 'أول ما نزل من القرآن: اقرأ باسم ربك الذي خلق. علّم الإنسان بالقلم. درس عظيم: الله يحب من يطلب العلم.'
    when 95  then 'الله أقسم بالتين والزيتون وطور سينين والبلد الأمين. خلق الإنسان في أحسن تقويم — جميل وذكي. ومن آمن وعمل صالحاً، له أجر غير ممنون.'
    when 94  then 'الله شرح صدر النبي ﷺ بالإيمان ووضع عنه ثقل النبوة وأعلى ذكره. الدرس الذهبي: إن مع العسر يسراً. الفرج قريب، فلا تيأس.'
    when 93  then 'لما تأخر الوحي على النبي ﷺ، قال المشركون "ودَّعَه ربه". فنزلت هذه السورة: ما ودَّعك ربك وما قلى. الآخرة خير من الدنيا. واذكر نعم الله عليك.'
  end,
  case s.surah_number
    when 1   then 'كل مسلم يحفظها لأنها في الصلاة. ادعو بها ربنا أن يهدينا الطريق الصح.'
    when 114 then 'نقولها قبل النوم وفي الصباح علشان نحمي نفسنا.'
    when 113 then 'حماية من كل شر، خاصة الشر اللي مش بنحس بيه.'
    when 112 then 'تعلّم أن الله واحد، مايشبهش حاجة، مولود ولا والد.'
    when 111 then 'لا أحد يحمي من غضب الله، حتى لو كان قريباً من النبي.'
    when 110 then 'لما نفرح بنجاح، نشكر الله ونحمده، ما نتكبرش.'
    when 109 then 'كل واحد له دينه، نحترم الناس بس نتمسك بديننا.'
    when 108 then 'الله بيعوض من أحبه عوضاً عظيماً.'
    when 107 then 'الإيمان الحقيقي يظهر في معاملتنا للفقير واليتيم.'
    when 106 then 'الله أعطانا الأمان والطعام، علينا أن نشكره.'
    when 105 then 'الله يحمي بيته، ولا يستطيع أحد إيذاء أحبائه.'
    when 104 then 'الكلام الغلط على الناس له عقوبة كبيرة.'
    when 103 then 'الوقت أهم شيء. استخدمه في الإيمان والعمل الصالح.'
    when 102 then 'الدنيا ما تستحق ننسى الآخرة.'
    when 101 then 'يوم القيامة ميزان كل عمل.'
    when 100 then 'الإنسان ينسى نعمة ربه، ولكن الله لا ينسى ما يفعل.'
    when 99   then 'كل عمل صغير محسوب، حتى ذرة الخير.'
    when 98   then 'الإيمان والعمل الصالح طريقنا لخير البرية.'
    when 97   then 'في رمضان نجتهد، خاصة في العشر الأواخر.'
    when 96   then 'العلم نور، والقراءة طريق المعرفة.'
    when 95   then 'الإنسان مكرّم عند الله، فلا يحقّر نفسه.'
    when 94   then 'بعد كل صعوبة، يأتي الفرج.'
    when 93   then 'الله لا ينسى أحبابه، نعمه علينا كثيرة.'
  end,
  true,
  'ar'
from surahs s
where s.surah_number in (1,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114)
on conflict do nothing;

-- ──────── Default 6 steps per surah ────────
-- Each step is created with sensible defaults. Admin can edit/reorder/delete.
do $$
declare
  s record;
begin
  for s in select id, name_arabic, surah_number from surahs where is_active loop
    -- Step 1: Listen ×3 times
    insert into surah_steps (surah_id, step_number, step_type, step_title, step_description, required_completion_count, requires_mother_approval, xp_reward, display_order, is_active)
    values (s.id, 1, 'listen', 'اسمع السورة ٣ مرات', 'استمع بتركيز للسورة كاملة من القارئ علافسي', 3, false, 10, 1, true)
    on conflict (surah_id, step_number) do nothing;

    -- Step 2: Story
    insert into surah_steps (surah_id, step_number, step_type, step_title, step_description, required_completion_count, requires_mother_approval, xp_reward, display_order, is_active)
    values (s.id, 2, 'story', 'اقرأ قصة السورة', 'اعرف معنى السورة والقصة وراءها', 1, false, 15, 2, true)
    on conflict (surah_id, step_number) do nothing;

    -- Step 3: Listen + Repeat ×2 rounds
    insert into surah_steps (surah_id, step_number, step_type, step_title, step_description, required_completion_count, requires_mother_approval, xp_reward, display_order, is_active)
    values (s.id, 3, 'listen_repeat', 'اسمع وردد ٢ مرة', 'استمع لكل آية ثم رددها بصوت عالٍ', 2, false, 20, 3, true)
    on conflict (surah_id, step_number) do nothing;

    -- Step 4: Recite to Mom (requires mother approval)
    insert into surah_steps (surah_id, step_number, step_type, step_title, step_description, required_completion_count, requires_mother_approval, xp_reward, display_order, is_active)
    values (s.id, 4, 'recite_to_mom', 'سمّع السورة لماما', 'اقرأ السورة كاملة لماما من غير ما تبص في المصحف', 1, true, 30, 4, true)
    on conflict (surah_id, step_number) do nothing;

    -- Step 5: Tell Story to Mom (requires mother approval)
    insert into surah_steps (surah_id, step_number, step_type, step_title, step_description, required_completion_count, requires_mother_approval, xp_reward, display_order, is_active)
    values (s.id, 5, 'tell_story', 'احكي قصة السورة لماما', 'احكي قصة السورة بأسلوبك مع الدرس اللي تعلمته', 1, true, 25, 5, true)
    on conflict (surah_id, step_number) do nothing;

    -- Step 6: Life Mission (requires mother approval)
    insert into surah_steps (surah_id, step_number, step_type, step_title, step_description, required_completion_count, requires_mother_approval, xp_reward, display_order, is_active)
    values (s.id, 6, 'life_mission', 'طبّق درس السورة في حياتك', 'نفّذ مهمة عملية من اللي تعلمته من السورة', 1, true, 35, 6, true)
    on conflict (surah_id, step_number) do nothing;
  end loop;
end $$;

-- ──────── Life missions per surah ────────
do $$
declare s record;
begin
  for s in select id, surah_number from surahs where is_active loop
    insert into life_missions (surah_id, title, description, target_audience, difficulty, xp_reward, display_order, is_active)
    values (s.id,
      case s.surah_number
        when 1   then 'اقرأ الفاتحة في كل صلاة بتركيز'
        when 114 then 'اقرأ المعوذات قبل النوم لمدة أسبوع'
        when 113 then 'احفظ المعوذتين وادع الله أن يحفظك'
        when 112 then 'قل لأحد ١٠ مرات: الله واحد لا شريك له'
        when 111 then 'تجنب إيذاء أي أحد لمدة يومين'
        when 110 then 'اشكر الله بعد كل نعمة في يومك'
        when 109 then 'احترم زميلاً يخالفك في الرأي'
        when 108 then 'تصدق على فقير أو ساعد محتاجاً'
        when 107 then 'ساعد يتيماً أو محتاجاً اليوم'
        when 106 then 'اشكر الله قبل وبعد كل وجبة'
        when 105 then 'صلِّ في مسجد أو مع عائلتك'
        when 104 then 'تجنب الكلام الغلط على الناس لمدة يوم'
        when 103 then 'استغل ساعة كاملة في عمل صالح'
        when 102 then 'تصدق بشيء تحبه'
        when 101 then 'افعل ١٠ أعمال خير اليوم'
        when 100 then 'احصِ نعم الله عليك في ٥ دقائق'
        when 99  then 'افعل خيراً ولو صغيراً'
        when 98  then 'تعلم آية جديدة وادرس معناها'
        when 97  then 'صلِّ ركعتين في الليل'
        when 96  then 'اقرأ كتاباً مفيداً اليوم'
        when 95  then 'اعتنِ بنفسك ونظافتك (الله جميل يحب الجمال)'
        when 94  then 'ساعد شخصاً في ضيق'
        when 93  then 'اذكر نعم الله عليك واشكره'
      end,
      'مهمة عملية لتطبيق درس السورة في حياتك اليومية',
      'with_mother',
      'easy',
      15,
      1,
      true
    )
    on conflict do nothing;
  end loop;
end $$;

-- ──────── Sample avatar items (so /child/avatar isn't empty) ────────
insert into avatar_items (item_type, item_name, item_image_url, xp_cost, gender, category, is_active) values
  ('head',       'كوفية بيضاء',    '🧢', 20,  'boy',  'islamic', true),
  ('head',       'طاقية',          '🧒', 30,  'boy',  'islamic', true),
  ('head',       'حجاب وردي',      '🧕', 30,  'girl', 'islamic', true),
  ('head',       'حجاب أزرق',      '🧕', 30,  'girl', 'islamic', true),
  ('body',       'ثوب أبيض',       '👕', 50,  'boy',  'islamic', true),
  ('body',       'فستان طويل',     '👗', 50,  'girl', 'islamic', true),
  ('accessory',  'نظارة',          '👓', 25,  'both', 'general', true),
  ('accessory',  'سبحة',           '📿', 40,  'both', 'islamic', true),
  ('accessory',  'مصحف',           '📖', 50,  'both', 'islamic', true),
  ('accessory',  'نجمة',           '⭐', 15,  'both', 'general', true),
  ('accessory',  'قلب',            '❤️', 20,  'both', 'general', true),
  ('accessory',  'تاج',            '👑', 100, 'both', 'general', true),
  ('background', 'مسجد',           '🕌', 80,  'both', 'islamic', true),
  ('background', 'الكعبة',         '🕋', 100, 'both', 'islamic', true),
  ('background', 'مصحف وزهور',     '🌸', 60,  'both', 'general', true),
  ('background', 'سماء وقمر',      '🌙', 70,  'both', 'islamic', true)
on conflict do nothing;

-- ──────── Done ────────
select
  (select count(*) from surahs where is_active) as surahs,
  (select count(*) from surah_steps) as steps,
  (select count(*) from surah_stories) as stories,
  (select count(*) from life_missions) as missions,
  (select count(*) from avatar_items) as avatar_items;
