-- Migration pour supprimer les colonnes fileName et thumbnailFileName
-- Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- Description: Suppression des colonnes fileName et thumbnailFileName de la table photos
-- Ces colonnes ne sont plus nécessaires car les noms de fichiers sont extraits des URLs

-- Vérifier que les colonnes existent avant de les supprimer
DO $$
BEGIN
    -- Supprimer la colonne fileName si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'photos' AND column_name = 'fileName'
    ) THEN
        ALTER TABLE photos DROP COLUMN "fileName";
        RAISE NOTICE 'Colonne fileName supprimée';
    ELSE
        RAISE NOTICE 'Colonne fileName n''existe pas';
    END IF;

    -- Supprimer la colonne thumbnailFileName si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'photos' AND column_name = 'thumbnailFileName'
    ) THEN
        ALTER TABLE photos DROP COLUMN "thumbnailFileName";
        RAISE NOTICE 'Colonne thumbnailFileName supprimée';
    ELSE
        RAISE NOTICE 'Colonne thumbnailFileName n''existe pas';
    END IF;
END $$;

-- Vérifier la structure finale de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'photos' 
ORDER BY ordinal_position;
