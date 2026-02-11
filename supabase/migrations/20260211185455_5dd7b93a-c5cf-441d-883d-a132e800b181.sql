
-- Create storage bucket for competition files
INSERT INTO storage.buckets (id, name, public) VALUES ('competition-files', 'competition-files', true);

-- Create competition_files table
CREATE TABLE public.competition_files (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id uuid NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text,
  file_size integer,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  uploaded_by uuid
);

-- Enable RLS
ALTER TABLE public.competition_files ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view competition files" ON public.competition_files FOR SELECT USING (true);
CREATE POLICY "Admins can insert competition files" ON public.competition_files FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update competition files" ON public.competition_files FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete competition files" ON public.competition_files FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage policies
CREATE POLICY "Anyone can view competition files storage" ON storage.objects FOR SELECT USING (bucket_id = 'competition-files');
CREATE POLICY "Authenticated users can upload competition files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'competition-files' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete competition files" ON storage.objects FOR DELETE USING (bucket_id = 'competition-files' AND auth.role() = 'authenticated');
