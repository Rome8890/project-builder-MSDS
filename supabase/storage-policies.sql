-- ============================================================
-- Supabase Storage Bucket 정책 설정
-- Supabase Dashboard > SQL Editor에서 실행하세요
-- (버킷은 Dashboard > Storage에서 먼저 수동 생성 필요)
-- ============================================================

-- selfies 버킷: 본인만 업로드/조회
INSERT INTO storage.buckets (id, name, public)
VALUES ('selfies', 'selfies', false)
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('visions', 'visions', true)
ON CONFLICT DO NOTHING;

-- selfies 업로드 정책
CREATE POLICY "selfies: upload own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'selfies' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- selfies 조회 정책
CREATE POLICY "selfies: read own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'selfies' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- selfies 삭제 정책
CREATE POLICY "selfies: delete own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'selfies' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- visions 업로드 정책
CREATE POLICY "visions: upload own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'visions' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- visions 공개 조회 정책
CREATE POLICY "visions: public read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'visions');

-- visions 삭제 정책
CREATE POLICY "visions: delete own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'visions' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
